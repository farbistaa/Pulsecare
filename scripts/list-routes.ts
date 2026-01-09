import fs from 'fs';
import path from 'path';

interface Route {
  method: string;
  route: string;
  category: string;
  endpoint: string;
  source: string;
  lineNumber?: number;
}

/**
 * Formats a single cell for the table, ensuring perfect alignment.
 * It truncates the text, applies color, and then adds plain spaces for padding.
 */
function formatCell(text: string, width: number, color: string = ''): string {
  const reset = '\x1b[0m';
  // Truncate text to fit within the cell width
  const truncatedText = text.length > width ? text.substring(0, width - 3) + '...' : text;
  // Calculate padding based on the VISIBLE length of the text
  const padLength = Math.max(0, width - truncatedText.length);
  // Construct the cell: color + text + reset + padding
  return `${color}${truncatedText}${reset}${' '.repeat(padLength)}`;
}

function getCategoryFromPath(routePath: string): string {
  const parts = routePath.split('/').filter(Boolean);
  const skipPrefixes = ['api', 'v1', 'v2', 'v3'];
  for (const part of parts) {
    if (!skipPrefixes.includes(part.toLowerCase())) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
  }
  return 'General';
}

function getEndpointFromPath(routePath: string): string {
  const parts = routePath.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : '/';
}

function extractRoutes(filePath: string): Route[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const routes: Route[] = [];
  const lines = content.split('\n');
  const routeRegex = /app\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/g;
  
  lines.forEach((line, index) => {
    const matches = line.matchAll(routeRegex);
    for (const match of matches) {
      const [, method, routePath] = match;
      routes.push({
        method: method.toUpperCase(),
        route: routePath,
        category: getCategoryFromPath(routePath),
        endpoint: getEndpointFromPath(routePath),
        source: `server/routes.ts:${index + 1}`,
        lineNumber: index + 1
      });
    }
  });
  
  return routes;
}

function displayRoutesTable() {
  const routesFile = path.join(process.cwd(), 'server', 'routes.ts');
  
  if (!fs.existsSync(routesFile)) {
    console.error('❌ Routes file not found at:', routesFile);
    return;
  }
  
  const routes = extractRoutes(routesFile);
  
  console.log('\n\x1b[36mPulseCare API Route Info\x1b[0m');
  console.log(`\x1b[90mMapped ${routes.length} routes\x1b[0m\n`);

  // --- Column Widths (ADJUSTED) ---
  const CATEGORY_WIDTH = 15;
  const ROUTE_WIDTH = 42;      // Reduced from 45
  const ENDPOINT_WIDTH = 15;
  const METHOD_WIDTH = 8;
  const SOURCE_WIDTH = 23;     // Increased from 20
  
  // --- Table Borders (dynamically generated from widths) ---
  const divider = '┌' + '─'.repeat(CATEGORY_WIDTH + 2) + '┬' + '─'.repeat(ROUTE_WIDTH + 2) + '┬' + '─'.repeat(ENDPOINT_WIDTH + 2) + '┬' + '─'.repeat(METHOD_WIDTH + 2) + '┬' + '─'.repeat(SOURCE_WIDTH + 2) + '┐';
  const headerDivider = '├' + '─'.repeat(CATEGORY_WIDTH + 2) + '┼' + '─'.repeat(ROUTE_WIDTH + 2) + '┼' + '─'.repeat(ENDPOINT_WIDTH + 2) + '┼' + '─'.repeat(METHOD_WIDTH + 2) + '┼' + '─'.repeat(SOURCE_WIDTH + 2) + '┤';
  const bottomDivider = '└' + '─'.repeat(CATEGORY_WIDTH + 2) + '┴' + '─'.repeat(ROUTE_WIDTH + 2) + '┴' + '─'.repeat(ENDPOINT_WIDTH + 2) + '┴' + '─'.repeat(METHOD_WIDTH + 2) + '┴' + '─'.repeat(SOURCE_WIDTH + 2) + '┘';

  console.log(divider);
  console.log(`│ \x1b[1m${formatCell('CATEGORY', CATEGORY_WIDTH)}\x1b[0m │ \x1b[1m${formatCell('ROUTE', ROUTE_WIDTH)}\x1b[0m │ \x1b[1m${formatCell('ENDPOINT', ENDPOINT_WIDTH)}\x1b[0m │ \x1b[1m${formatCell('METHOD', METHOD_WIDTH)}\x1b[0m │ \x1b[1m${formatCell('SOURCE', SOURCE_WIDTH)}\x1b[0m │`);
  console.log(headerDivider);
  
  const sortedRoutes = routes.sort((a, b) => 
    a.category.localeCompare(b.category) || a.route.localeCompare(b.route)
  );
  
  const methodColors: Record<string, string> = {
    'GET': '\x1b[32m', 'POST': '\x1b[34m', 'PUT': '\x1b[33m',
    'PATCH': '\x1b[35m', 'DELETE': '\x1b[31m',
  };
  const dimColor = '\x1b[90m';
  
  sortedRoutes.forEach((route) => {
    const category = formatCell(route.category, CATEGORY_WIDTH, dimColor);
    const routePath = formatCell(route.route, ROUTE_WIDTH);
    const endpoint = formatCell(route.endpoint, ENDPOINT_WIDTH, dimColor);
    const method = formatCell(route.method, METHOD_WIDTH, methodColors[route.method]);
    const source = formatCell(route.source, SOURCE_WIDTH, dimColor);
    
    console.log(`│ ${category} │ ${routePath} │ ${endpoint} │ ${method} │ ${source} │`);
  });
  
  console.log(bottomDivider);
  
  const methodCount = routes.reduce((acc, route) => {
    acc[route.method] = (acc[route.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n\x1b[1mRoute Summary by Method:\x1b[0m');
  Object.entries(methodCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([method, count]) => {
      const color = methodColors[method] || '';
      console.log(`  ${color}${method}\x1b[0m: ${count} routes`);
    });
  
  console.log('');
}

displayRoutesTable();