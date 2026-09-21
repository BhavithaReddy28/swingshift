const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'src/app/layout.tsx', find: 'Digital Heroes', replace: 'SwingShift' },
  { file: 'src/components/navigation/Header.tsx', find: 'Digital<span className="text-primary">Heroes</span>', replace: 'Swing<span className="text-primary">Shift</span>' },
  { file: 'src/components/navigation/Footer.tsx', find: 'Digital Heroes.', replace: 'SwingShift.' },
  { file: 'src/app/(auth)/signup/page.tsx', find: 'Join Digital Heroes', replace: 'Join SwingShift' },
  { file: 'src/app/api/stripe/checkout/route.ts', find: 'Digital Heroes ${', replace: 'SwingShift ${' },
  { file: 'src/app/api/stripe/donation/route.ts', find: '- Digital Heroes', replace: '- SwingShift' },
  { file: 'src/app/(public)/charities/[slug]/page.tsx', find: 'subscribe to Digital Heroes', replace: 'subscribe to SwingShift' },
];

replacements.forEach(({ file, find, replace }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(find, replace);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
