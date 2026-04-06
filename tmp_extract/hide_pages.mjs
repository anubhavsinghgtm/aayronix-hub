import fs from 'fs';
import path from 'path';

const dirs = ['src/pages', 'src/pages/services'];
const skip = ['index.astro']; // Don't skip index.astro in services though.

const comingSoonBlock = `
  <div style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem;">
    <span style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; border: 1px solid rgba(59, 130, 246, 0.2);">Work In Progress</span>
    <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Coming Soon</h1>
    <p style="color: #94a3b8; font-size: 1.25rem; max-width: 600px; margin: 0 auto;">We are currently working hard to prepare this content. Please check back later.</p>
    <a href="/" style="display: inline-block; margin-top: 2rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.375rem; font-weight: 500; transition: background 0.2s;">Back to Home</a>
  </div>

  {/*  
`;

const closeBlock = `
  */}
`;

for (const dir of dirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) continue;
  
  const files = fs.readdirSync(fullPath);
  for (const file of files) {
    if (!file.endsWith('.astro')) continue;
    if (dir === 'src/pages' && skip.includes(file)) continue;

    const filePath = path.join(fullPath, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('Work In Progress')) {
      console.log('Skipping (already processed):', filePath);
      continue;
    }

    // Split at <Header />
    const headerIndex = content.indexOf('<Header />');
    if (headerIndex === -1) {
      console.log('No <Header /> found in', filePath);
      continue;
    }

    const afterHeader = headerIndex + '<Header />'.length;
    const part1 = content.slice(0, afterHeader);
    const part2 = content.slice(afterHeader);

    // Now find the end point: either before <Footer /> or before </BaseLayout>
    let endMarker = '<Footer />';
    let endIndex = part2.lastIndexOf(endMarker);
    if (endIndex === -1) {
      endMarker = '</BaseLayout>';
      endIndex = part2.lastIndexOf(endMarker);
    }
    
    if (endIndex === -1) {
      console.log('No Footer or BaseLayout end found in', filePath);
      continue;
    }

    const beforeEnd = part2.slice(0, endIndex);
    const afterEnd = part2.slice(endIndex);

    // Rebuild
    const rebuilt = part1 + '\n<!-- Coming Soon Snippet -->' + comingSoonBlock + beforeEnd + closeBlock + afterEnd;
    fs.writeFileSync(filePath, rebuilt);
    console.log('Processed', filePath);
  }
}
