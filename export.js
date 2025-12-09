// Embedded CSS for export (avoids CORS issues with file:// protocol)
const EMBEDDED_CSS = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #1a1a1a;
    color: #e0e0e0;
    overflow: hidden;
}

#canvas-container {
    position: relative;
    overflow: hidden;
}

#canvas {
    display: block;
    cursor: crosshair;
}`;

// Export current settings to JSON
function exportSettingsJSON() {
    const settingsCopy = JSON.parse(JSON.stringify(settings));
    const jsonString = JSON.stringify(settingsCopy, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'svg-grid-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export to standalone HTML file
function exportToStandaloneHTML() {
    // Use embedded CSS (works with file:// protocol)
    const cssContent = EMBEDDED_CSS;
    
    // Get current settings and svgSymbols
    const currentSettings = JSON.parse(JSON.stringify(settings));
    const currentSvgSymbols = typeof svgSymbols !== 'undefined' ? svgSymbols : {};
    
    // Create standalone HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Grid Canvas</title>
    <style>
${cssContent}
        body {
            padding-bottom: 0 !important; /* No preset buttons in exported version */
        }
        #container {
            height: 100vh !important; /* Full height without preset buttons */
        }
    </style>
</head>
<body>
    <div id="canvas-container"${currentSettings.viewportFill ? ' style="width: 100vw; height: 100vh; position: fixed; top: 0; left: 0;"' : ` style="width: ${currentSettings.canvasWidth}px; height: ${currentSettings.canvasHeight}px; margin: 0 auto; display: block;"`}>
        <canvas id="canvas"></canvas>
    </div>

    <script>
        // Canvas and context
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Settings - baked in with current values
        const settings = ${JSON.stringify(currentSettings, null, 8)};

        // Grid data
        let grid = [];
        let cellWidth = 0;
        let cellHeight = 0;

        // SVG Path definitions for 40 symbols
        const svgSymbols = ${JSON.stringify(currentSvgSymbols, null, 8)};

        // Convert SVG path to Path2D
        function createPath2D(pathString) {
            return new Path2D(pathString);
        }

        // Initialize grid
        function initGrid() {
            grid = [];
            const rows = settings.rows;
            const cols = settings.columns;
            
            cellWidth = canvas.width / cols;
            cellHeight = canvas.height / rows;
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    grid.push({
                        row,
                        col,
                        x: col * cellWidth + cellWidth / 2,
                        y: row * cellHeight + cellHeight / 2,
                        rotation: 0,
                        targetRotation: 0,
                        startRotation: 0,
                        animationProgress: 0,
                        isHovered: false,
                        entrySide: null,
                        shouldReturn: false
                    });
                }
            }
        }

        // Check if point is inside symbol bounds
        function isPointInSymbol(x, y, symbolX, symbolY, symbolName) {
            const size = (Math.min(cellWidth, cellHeight) * settings.symbolSize / 100) / 2;
            const dx = Math.abs(x - symbolX);
            const dy = Math.abs(y - symbolY);
            return Math.sqrt(dx * dx + dy * dy) < size;
        }

        // Determine entry side
        function getEntrySide(mouseX, mouseY, symbolX, symbolY) {
            const dx = mouseX - symbolX;
            const dy = mouseY - symbolY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                return dx > 0 ? 'right' : 'left';
            } else {
                return dy > 0 ? 'bottom' : 'top';
            }
        }

        // Calculate target rotation based on entry side
        function getTargetRotation(entrySide) {
            let angle = settings.rotationAngle;
            
            if (entrySide === 'left') {
                angle = settings.invertRotation ? angle : -angle;
            } else if (entrySide === 'right') {
                angle = settings.invertRotation ? -angle : angle;
            } else if (entrySide === 'top') {
                angle = settings.invertRotation ? angle : -angle;
            } else if (entrySide === 'bottom') {
                angle = settings.invertRotation ? -angle : angle;
            }
            
            return angle;
        }

        // Easing functions
        const easingFunctions = {
            'linear': (t) => t,
            'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            'ease-in': (t) => t * t,
            'ease-out': (t) => t * (2 - t),
            'ease-in-out-cubic': (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            'ease-in-cubic': (t) => t * t * t,
            'ease-out-cubic': (t) => 1 - Math.pow(1 - t, 3),
            'ease-in-out-quart': (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
            'bounce': (t) => {
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            },
            'elastic': (t) => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
            }
        };

        // Get easing function
        function getEasingFunction(type) {
            return easingFunctions[type] || easingFunctions['ease-in-out'];
        }

        // Update rotations with animation
        function updateRotations() {
            let needsRedraw = false;
            const easing = getEasingFunction(settings.animationType);
            
            grid.forEach(cell => {
                if (Math.abs(cell.rotation - cell.targetRotation) > 0.1) {
                    needsRedraw = true;
                    if (settings.animationEnabled) {
                        cell.animationProgress += settings.animationSpeed;
                        if (cell.animationProgress > 1) {
                            cell.animationProgress = 1;
                        }
                        
                        const eased = easing(cell.animationProgress);
                        const range = cell.targetRotation - cell.startRotation;
                        cell.rotation = cell.startRotation + range * eased;
                    } else {
                        cell.rotation = cell.targetRotation;
                        cell.animationProgress = 1;
                    }
                } else {
                    cell.rotation = cell.targetRotation;
                    cell.animationProgress = 1;
                    
                    if (cell.shouldReturn && settings.returnOnLeave && cell.targetRotation !== 0) {
                        cell.startRotation = cell.targetRotation;
                        cell.targetRotation = 0;
                        cell.animationProgress = 0;
                        cell.shouldReturn = false;
                        needsRedraw = true;
                    } else if (cell.shouldReturn && !settings.returnOnLeave) {
                        cell.shouldReturn = false;
                    }
                }
            });
            
            return needsRedraw;
        }

        // Render function
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const size = Math.min(cellWidth, cellHeight) * settings.symbolSize / 100;
            const scale = size / 40;
            
            grid.forEach(cell => {
                ctx.save();
                ctx.translate(cell.x, cell.y);
                ctx.scale(scale, scale);
                ctx.rotate(cell.rotation * Math.PI / 180);
                
                const pathString = svgSymbols[settings.currentSymbol];
                if (pathString) {
                    const path = new Path2D(pathString);
                    ctx.strokeStyle = settings.strokeColor;
                    ctx.lineWidth = settings.strokeWidth / scale;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke(path);
                }
                
                ctx.restore();
            });
        }

        // Animation loop
        function animate() {
            const needsRedraw = updateRotations();
            if (needsRedraw) {
                render();
            }
            requestAnimationFrame(animate);
        }

        // Handle mouse move
        function handleMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            grid.forEach(cell => {
                const wasHovered = cell.isHovered;
                const isInside = isPointInSymbol(mouseX, mouseY, cell.x, cell.y, settings.currentSymbol);
                
                if (isInside && !wasHovered) {
                    cell.isHovered = true;
                    cell.shouldReturn = false;
                    const entrySide = getEntrySide(mouseX, mouseY, cell.x, cell.y);
                    cell.entrySide = entrySide;
                    cell.startRotation = cell.rotation;
                    cell.targetRotation = getTargetRotation(entrySide);
                    cell.animationProgress = 0;
                } else if (!isInside && wasHovered) {
                    cell.isHovered = false;
                    if (Math.abs(cell.rotation - cell.targetRotation) < 0.1) {
                        if (settings.returnOnLeave) {
                            cell.startRotation = cell.targetRotation;
                            cell.targetRotation = 0;
                            cell.animationProgress = 0;
                        }
                        cell.shouldReturn = false;
                    } else {
                        cell.shouldReturn = true;
                    }
                }
            });
            
            render();
        }

        // Handle mouse leave
        function handleMouseLeave() {
            grid.forEach(cell => {
                if (cell.isHovered) {
                    cell.isHovered = false;
                    if (Math.abs(cell.rotation - cell.targetRotation) < 0.1) {
                        if (settings.returnOnLeave) {
                            cell.startRotation = cell.targetRotation;
                            cell.targetRotation = 0;
                            cell.animationProgress = 0;
                        }
                        cell.shouldReturn = false;
                    } else {
                        cell.shouldReturn = true;
                    }
                }
            });
            render();
        }

        // Resize canvas
        function resizeCanvas() {
            if (settings.viewportFill) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            } else {
                canvas.width = settings.canvasWidth;
                canvas.height = settings.canvasHeight;
            }
            initGrid();
            render();
        }

        // Initialize
        function init() {
            resizeCanvas();
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', handleMouseLeave);
            
            window.addEventListener('resize', () => {
                if (settings.viewportFill) {
                    resizeCanvas();
                }
            });
            
            render();
            animate();
        }

        // Start
        init();
    </script>
</body>
</html>`;

    // Download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'svg-grid-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize export buttons when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const exportHtmlBtn = document.getElementById('export-html-btn');
        const exportJsonBtn = document.getElementById('export-json-btn');
        
        if (exportHtmlBtn) {
            exportHtmlBtn.addEventListener('click', exportToStandaloneHTML);
        }
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', exportSettingsJSON);
        }
    });
} else {
    const exportHtmlBtn = document.getElementById('export-html-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');
    
    if (exportHtmlBtn) {
        exportHtmlBtn.addEventListener('click', exportToStandaloneHTML);
    }
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', exportSettingsJSON);
    }
}

