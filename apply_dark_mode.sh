#!/bin/bash
for file in src/pages/DirectoryPage.tsx src/components/ContactCard.tsx src/components/TreeView.tsx src/pages/FavoritesPage.tsx src/pages/AdminPage.tsx src/pages/OrgChartPage.tsx; do
  if [ -f "$file" ]; then
    sed -i 's/bg-white/bg-white dark:bg-slate-800/g' $file
    sed -i 's/text-slate-800/text-slate-800 dark:text-slate-100/g' $file
    sed -i 's/text-slate-700/text-slate-700 dark:text-slate-300/g' $file
    sed -i 's/text-slate-600/text-slate-600 dark:text-slate-400/g' $file
    sed -i 's/text-slate-500/text-slate-500 dark:text-slate-400/g' $file
    sed -i 's/text-slate-400/text-slate-400 dark:text-slate-500/g' $file
    sed -i 's/bg-slate-50/bg-slate-50 dark:bg-slate-800\/50/g' $file
    sed -i 's/bg-slate-100/bg-slate-100 dark:bg-slate-700/g' $file
    sed -i 's/bg-slate-200/bg-slate-200 dark:bg-slate-700/g' $file
    sed -i 's/border-slate-100/border-slate-100 dark:border-slate-700/g' $file
    sed -i 's/border-slate-200/border-slate-200 dark:border-slate-700/g' $file
    sed -i 's/border-slate-300/border-slate-300 dark:border-slate-600/g' $file
    sed -i 's/bg-teal-50/bg-teal-50 dark:bg-teal-900\/30/g' $file
    sed -i 's/hover:bg-teal-50/hover:bg-teal-50 dark:hover:bg-teal-900\/30/g' $file
    sed -i 's/hover:bg-slate-100/hover:bg-slate-100 dark:hover:bg-slate-700/g' $file
    sed -i 's/hover:bg-slate-200/hover:bg-slate-200 dark:hover:bg-slate-600/g' $file
    sed -i 's/bg-slate-800 text-white/bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900/g' $file
    sed -i 's/hover:border-teal-300/hover:border-teal-300 dark:hover:border-teal-700/g' $file
    sed -i 's/hover:border-teal-100/hover:border-teal-100 dark:hover:border-teal-800/g' $file
    sed -i 's/bg-red-50/bg-red-50 dark:bg-red-900\/30/g' $file
  fi
done
