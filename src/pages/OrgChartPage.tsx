import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { hierarchy, tree } from "d3-hierarchy";
import { Network, ZoomIn, ZoomOut, X } from "lucide-react";
import ContactCard from "../components/ContactCard";
import { AnimatePresence, motion } from "motion/react";

interface TreeNode {
  name: string;
  deptId?: string;
  children?: TreeNode[];
}

export default function OrgChartPage() {
  const departments = useStore((state) => state.departments);
  const [zoom, setZoom] = useState(1);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Build tree data
  const treeData = useMemo(() => {
    const root: TreeNode = { name: "남양주시청", children: [] };
    
    // Group by orgName
    const orgMap = new Map<string, TreeNode>();
    
    departments.forEach(dept => {
      const orgName = dept.orgName;
      if (!orgMap.has(orgName)) {
        const newOrg: TreeNode = { name: orgName, children: [] };
        orgMap.set(orgName, newOrg);
        
        // Special case for top level items
        if (orgName === "시 장" || orgName === "부시장") {
          // Add directly to root but keep them at top? 
          // hierarchy will just put them as children of root.
        }
        root.children!.push(newOrg);
      }
      
      const orgNode = orgMap.get(orgName)!;
      
      const deptNode: TreeNode = {
        name: dept.deptName,
        deptId: dept.id,
      };

      if (dept.teams && dept.teams.length > 0) {
        deptNode.children = dept.teams.map(team => ({
          name: team.teamName,
          deptId: dept.id
        }));
      }
      
      orgNode.children!.push(deptNode);
    });

    return root;
  }, [departments]);

  // Compute layout
  const { nodes, links, width, height } = useMemo(() => {
    const rootHierarchy = hierarchy(treeData);
    
    // Calculate required height based on number of leaf nodes
    const leafNodes = rootHierarchy.leaves().length;
    const svgHeight = Math.max(800, leafNodes * 40);
    const svgWidth = 1200;

    const treeLayout = tree<TreeNode>()
      .size([svgHeight - 100, svgWidth - 250])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 2));

    const rootNode = treeLayout(rootHierarchy);
    return {
      nodes: rootNode.descendants(),
      links: rootNode.links(),
      width: svgWidth,
      height: svgHeight
    };
  }, [treeData]);

  const handleNodeClick = (deptId?: string) => {
    if (deptId) {
      setSelectedDeptId(deptId);
    }
  };

  const selectedDepartment = useMemo(() => {
    if (!selectedDeptId) return null;
    return departments.find(d => d.id === selectedDeptId) || null;
  }, [departments, selectedDeptId]);

  return (
    <div className="flex flex-col h-screen md:h-full bg-slate-50 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Network className="w-5 h-5 text-teal-600" />
          조직도 마인드맵
        </h1>
        <p className="text-xs text-slate-500 mt-1">부서를 클릭하면 상세 정보를 볼 수 있습니다.</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-600">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))} className="p-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-600">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 pt-32 md:pt-8 w-full h-full custom-scrollbar flex justify-center cursor-grab active:cursor-grabbing">
        <div 
          className="transform-gpu origin-top-left transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, minWidth: width, minHeight: height }}
        >
          <svg width={width} height={height} className="overflow-visible">
            <g transform="translate(100, 50)">
              {/* Draw links */}
              {links.map((link, i) => {
                const sourceWidth = link.source.depth === 0 ? 100 : 120;
                const startY = link.source.y + sourceWidth;
                const endY = link.target.y;
                
                const pathData = `
                  M ${startY} ${link.source.x}
                  C ${(startY + endY) / 2} ${link.source.x},
                    ${(startY + endY) / 2} ${link.target.x},
                    ${endY} ${link.target.x}
                `;
                return (
                  <path
                    key={i}
                    d={pathData}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                );
              })}

              {/* Draw nodes */}
              {nodes.map((node, i) => {
                const isLeaf = !node.children;
                const isRoot = node.depth === 0;
                const nodeWidth = isRoot ? 100 : isLeaf ? 140 : 120;
                
                return (
                  <g
                    key={i}
                    transform={`translate(${node.y},${node.x})`}
                    onClick={() => handleNodeClick(node.data.deptId)}
                    className={`${node.data.deptId ? 'cursor-pointer hover:opacity-80' : ''}`}
                  >
                    <rect
                      x={0}
                      y={-16}
                      width={nodeWidth}
                      height={32}
                      rx={6}
                      fill={isRoot ? "#0d9488" : isLeaf ? "#ffffff" : "#f1f5f9"}
                      stroke={isRoot ? "#0d9488" : isLeaf ? "#94a3b8" : "#cbd5e1"}
                      strokeWidth={isLeaf ? 1 : 0}
                      className={isLeaf ? "shadow-sm" : ""}
                      style={{ transition: "all 0.2s" }}
                    />
                    <text
                      dy="0.32em"
                      x={nodeWidth / 2}
                      textAnchor="middle"
                      fill={isRoot ? "#ffffff" : "#334155"}
                      fontSize={isRoot ? "14px" : "13px"}
                      fontWeight={isRoot ? "bold" : "500"}
                      className="pointer-events-none"
                    >
                      {node.data.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {selectedDepartment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative bg-white rounded-2xl shadow-xl"
            >
              <button
                onClick={() => setSelectedDeptId(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <ContactCard department={selectedDepartment} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
