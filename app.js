// Canvas and context (will be initialized in init)
let canvas;
let ctx;

// Settings
const settings = {
    rows: 10,
    columns: 10,
    symbolSize: 60,
    rotationAngle: 90,
    invertRotation: false,
    animationEnabled: true,
    animationSpeed: 0.1,
    returnOnLeave: true,
    animationType: 'ease-in-out',
    viewportFill: true,
    canvasWidth: 800,
    canvasHeight: 600,
    strokeColor: '#4a9eff',
    strokeWidth: 3,
    currentSymbol: 'plus'
};

// Grid data
let grid = [];
let cellWidth = 0;
let cellHeight = 0;
let symbolPaths = {};

// SVG Path definitions for 40 symbols
const svgSymbols = {
    'plus': 'M -20 0 L 20 0 M 0 -20 L 0 20',
    'x': 'M -15 -15 L 15 15 M 15 -15 L -15 15',
    'circle': 'M 0 -20 A 20 20 0 1 1 0 20 A 20 20 0 1 1 0 -20',
    'square': 'M -20 -20 L 20 -20 L 20 20 L -20 20 Z',
    'triangle-up': 'M 0 -20 L -17.32 10 L 17.32 10 Z',
    'triangle-down': 'M 0 20 L -17.32 -10 L 17.32 -10 Z',
    'triangle-right': 'M 20 0 L -10 -17.32 L -10 17.32 Z',
    'star-5': 'M 0 -20 L 5.88 -6.18 L 19.02 -6.18 L 7.07 2.36 L 11.76 15.45 L 0 7.64 L -11.76 15.45 L -7.07 2.36 L -19.02 -6.18 L -5.88 -6.18 Z',
    'star-6': 'M 0 -20 L 5.77 -5.77 L 20 -5.77 L 8.16 2.04 L 13.93 16.33 L 0 8.16 L -13.93 16.33 L -8.16 2.04 L -20 -5.77 L -5.77 -5.77 Z',
    'heart': 'M 0 -10 C -5 -15 -15 -10 -15 -5 C -15 0 -5 10 0 20 C 5 10 15 0 15 -5 C 15 -10 5 -15 0 -10 Z',
    'diamond': 'M 0 -20 L 20 0 L 0 20 L -20 0 Z',
    'hexagon': 'M 0 -20 L 17.32 -10 L 17.32 10 L 0 20 L -17.32 10 L -17.32 -10 Z',
    'octagon': 'M 0 -20 L 14.14 -14.14 L 20 0 L 14.14 14.14 L 0 20 L -14.14 14.14 L -20 0 L -14.14 -14.14 Z',
    'arrow-up': 'M 0 -20 L -10 0 L -5 0 L -5 20 L 5 20 L 5 0 L 10 0 Z',
    'arrow-down': 'M 0 20 L -10 0 L -5 0 L -5 -20 L 5 -20 L 5 0 L 10 0 Z',
    'arrow-left': 'M -20 0 L 0 -10 L 0 -5 L 20 -5 L 20 5 L 0 5 L 0 10 Z',
    'arrow-right': 'M 20 0 L 0 -10 L 0 -5 L -20 -5 L -20 5 L 0 5 L 0 10 Z',
    'arrow-up-right': 'M 0 -20 L 0 -5 L 15 -5 L 15 5 L 0 5 L 0 20 L 20 0 Z',
    'arrow-up-left': 'M -20 0 L 0 -20 L 0 -5 L -15 -5 L -15 5 L 0 5 L 0 20 Z',
    'arrow-down-right': 'M 0 20 L 0 5 L 15 5 L 15 -5 L 0 -5 L 0 -20 L 20 0 Z',
    'arrow-down-left': 'M -20 0 L 0 20 L 0 5 L -15 5 L -15 -5 L 0 -5 L 0 -20 Z',
    'chevron-up': 'M 0 -20 L -15 0 L 0 20 M 0 -20 L 15 0 L 0 20',
    'chevron-down': 'M 0 20 L -15 0 L 0 -20 M 0 20 L 15 0 L 0 -20',
    'chevron-left': 'M -20 0 L 0 -15 L 20 0 M -20 0 L 0 15 L 20 0',
    'chevron-right': 'M 20 0 L 0 -15 L -20 0 M 20 0 L 0 15 L -20 0',
    'spiral': 'M 0 0 Q 10 0 10 10 Q 10 20 0 20 Q -10 20 -10 10 Q -10 0 0 0',
    'wave': 'M -20 0 Q -10 -10 0 0 T 20 0',
    'zigzag': 'M -20 0 L -10 -10 L 0 0 L 10 -10 L 20 0',
    'cross': 'M -15 0 L 15 0 M 0 -15 L 0 15 M -10 -10 L 10 10 M 10 -10 L -10 10',
    'square-diamond': 'M 0 -20 L 14.14 -5.86 L 0 8.28 L -14.14 -5.86 Z M -14.14 5.86 L 0 -8.28 L 14.14 5.86 L 0 20 Z',
    'infinity': 'M -15 0 C -15 -8 -8 -15 0 -15 C 8 -15 15 -8 15 0 C 15 8 8 15 0 15 C -8 15 -15 8 -15 0 M 15 0 C 15 -8 8 -15 0 -15 C -8 -15 -15 -8 -15 0 C -15 8 -8 15 0 15 C 8 15 15 8 15 0',
    'bolt': 'M -10 -20 L 10 0 L -5 0 L 5 20 L -10 0 L 5 0 Z',
    'moon': 'M 0 -20 A 20 20 0 1 1 0 20 A 15 15 0 1 0 0 -20',
    'sun': 'M 0 -20 L 0 -25 M 0 20 L 0 25 M -20 0 L -25 0 M 20 0 L 25 0 M -14.14 -14.14 L -17.68 -17.68 M 14.14 14.14 L 17.68 17.68 M -14.14 14.14 L -17.68 17.68 M 14.14 -14.14 L 17.68 -17.68 M 0 -20 A 20 20 0 1 1 0 20 A 20 20 0 1 1 0 -20',
    'flower': 'M 0 -20 L 0 -15 M 0 20 L 0 15 M -20 0 L -15 0 M 20 0 L 15 0 M -14.14 -14.14 L -10.61 -10.61 M 14.14 14.14 L 10.61 10.61 M -14.14 14.14 L -10.61 10.61 M 14.14 -14.14 L 10.61 -10.61 M 0 -20 A 20 20 0 1 1 0 20 A 20 20 0 1 1 0 -20',
    'clover': 'M 0 -15 A 15 15 0 1 1 0 15 A 15 15 0 1 1 0 -15 M -15 0 A 15 15 0 1 1 15 0 A 15 15 0 1 1 -15 0',
    'pentagon': 'M 0 -20 L 19.02 -6.18 L 11.76 16.18 L -11.76 16.18 L -19.02 -6.18 Z',
    'rhombus': 'M 0 -20 L 20 0 L 0 20 L -20 0 Z',
    'kite': 'M 0 -20 L 15 0 L 0 10 L -15 0 Z',
    'house': 'M 0 -20 L -15 0 L -15 15 L 15 15 L 15 0 Z',
    'target': 'M 0 -20 A 20 20 0 1 1 0 20 A 20 20 0 1 1 0 -20 M 0 -15 A 15 15 0 1 1 0 15 A 15 15 0 1 1 0 -15 M 0 -10 A 10 10 0 1 1 0 10 A 10 10 0 1 1 0 -10'
};

// Initialize symbol select dropdown
function initSymbolSelect() {
    const select = document.getElementById('symbol-select');
    Object.keys(svgSymbols).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
        select.appendChild(option);
    });
}

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

// Check if point is inside symbol bounds (simple bounding box)
function isPointInSymbol(x, y, symbolX, symbolY, symbolName) {
    const size = (Math.min(cellWidth, cellHeight) * settings.symbolSize / 100) / 2;
    const dx = Math.abs(x - symbolX);
    const dy = Math.abs(y - symbolY);
    // Use circular hit detection for better accuracy
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
                // Update animation progress
                cell.animationProgress += settings.animationSpeed;
                if (cell.animationProgress > 1) {
                    cell.animationProgress = 1;
                }
                
                // Apply easing
                const eased = easing(cell.animationProgress);
                const range = cell.targetRotation - cell.startRotation;
                cell.rotation = cell.startRotation + range * eased;
            } else {
                cell.rotation = cell.targetRotation;
                cell.animationProgress = 1;
            }
        } else {
            // Reached target rotation
            cell.rotation = cell.targetRotation;
            cell.animationProgress = 1;
            
            if (cell.shouldReturn && settings.returnOnLeave && cell.targetRotation !== 0) {
                // Start returning to 0
                cell.startRotation = cell.targetRotation;
                cell.targetRotation = 0;
                cell.animationProgress = 0;
                cell.shouldReturn = false;
                needsRedraw = true;
            } else if (cell.shouldReturn && !settings.returnOnLeave) {
                // Don't return, just stop
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
            // Entering
            cell.isHovered = true;
            cell.shouldReturn = false; // Cancel any pending return
            const entrySide = getEntrySide(mouseX, mouseY, cell.x, cell.y);
            cell.entrySide = entrySide;
            cell.startRotation = cell.rotation;
            cell.targetRotation = getTargetRotation(entrySide);
            cell.animationProgress = 0;
        } else if (!isInside && wasHovered) {
            // Leaving - mark that we should return after completing current rotation
            cell.isHovered = false;
            // Check if we've reached the target rotation
            if (Math.abs(cell.rotation - cell.targetRotation) < 0.1) {
                // Already at target, return immediately if enabled
                if (settings.returnOnLeave) {
                    cell.startRotation = cell.targetRotation;
                    cell.targetRotation = 0;
                    cell.animationProgress = 0;
                }
                cell.shouldReturn = false;
            } else {
                // Still rotating, mark to return after completion
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
            // Check if we've reached the target rotation
            if (Math.abs(cell.rotation - cell.targetRotation) < 0.1) {
                // Already at target, return immediately if enabled
                if (settings.returnOnLeave) {
                    cell.startRotation = cell.targetRotation;
                    cell.targetRotation = 0;
                    cell.animationProgress = 0;
                }
                cell.shouldReturn = false;
            } else {
                // Still rotating, mark to return after completion
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

// Apply preset settings
function applyPreset(presetSettings) {
    if (!presetSettings) return;
    
    // Update all settings
    Object.keys(presetSettings).forEach(key => {
        if (settings.hasOwnProperty(key)) {
            settings[key] = presetSettings[key];
        }
    });
    
    // Update UI elements
    document.getElementById('rows-slider').value = settings.rows;
    document.getElementById('rows-value').textContent = settings.rows;
    document.getElementById('columns-slider').value = settings.columns;
    document.getElementById('columns-value').textContent = settings.columns;
    document.getElementById('size-slider').value = settings.symbolSize;
    document.getElementById('size-value').textContent = settings.symbolSize + '%';
    document.getElementById('angle-slider').value = settings.rotationAngle;
    document.getElementById('angle-value').textContent = settings.rotationAngle + '°';
    document.getElementById('invert-rotation').checked = settings.invertRotation;
    document.getElementById('animation-toggle').checked = settings.animationEnabled;
    document.getElementById('speed-slider').value = settings.animationSpeed;
    document.getElementById('speed-value').textContent = settings.animationSpeed.toFixed(2);
    document.getElementById('return-on-leave').checked = settings.returnOnLeave;
    document.getElementById('animation-type').value = settings.animationType;
    document.getElementById('viewport-fill').checked = settings.viewportFill;
    document.getElementById('canvas-width-group').style.display = settings.viewportFill ? 'none' : 'block';
    document.getElementById('canvas-height-group').style.display = settings.viewportFill ? 'none' : 'block';
    document.getElementById('width-slider').value = settings.canvasWidth;
    document.getElementById('width-value').textContent = settings.canvasWidth + 'px';
    document.getElementById('height-slider').value = settings.canvasHeight;
    document.getElementById('height-value').textContent = settings.canvasHeight + 'px';
    document.getElementById('stroke-color').value = settings.strokeColor;
    document.getElementById('stroke-width-slider').value = settings.strokeWidth;
    document.getElementById('stroke-width-value').textContent = settings.strokeWidth + 'px';
    document.getElementById('symbol-select').value = settings.currentSymbol;
    
    // Reset grid and reinitialize
    resizeCanvas();
}

// Setup event listeners
function setupEventListeners() {
    // Sliders
    document.getElementById('rows-slider').addEventListener('input', (e) => {
        settings.rows = parseInt(e.target.value);
        document.getElementById('rows-value').textContent = settings.rows;
        initGrid();
        render();
    });

    document.getElementById('columns-slider').addEventListener('input', (e) => {
        settings.columns = parseInt(e.target.value);
        document.getElementById('columns-value').textContent = settings.columns;
        initGrid();
        render();
    });

    document.getElementById('size-slider').addEventListener('input', (e) => {
        settings.symbolSize = parseInt(e.target.value);
        document.getElementById('size-value').textContent = settings.symbolSize + '%';
        render();
    });

    document.getElementById('angle-slider').addEventListener('input', (e) => {
        settings.rotationAngle = parseInt(e.target.value);
        document.getElementById('angle-value').textContent = settings.rotationAngle + '°';
        // Update hovered cells
        grid.forEach(cell => {
            if (cell.isHovered) {
                cell.shouldReturn = false; // Cancel any pending return
                cell.startRotation = cell.rotation;
                cell.targetRotation = getTargetRotation(cell.entrySide);
                cell.animationProgress = 0;
            }
        });
        render();
    });

    document.getElementById('speed-slider').addEventListener('input', (e) => {
        settings.animationSpeed = parseFloat(e.target.value);
        document.getElementById('speed-value').textContent = settings.animationSpeed.toFixed(2);
    });

    document.getElementById('width-slider').addEventListener('input', (e) => {
        settings.canvasWidth = parseInt(e.target.value);
        document.getElementById('width-value').textContent = settings.canvasWidth + 'px';
        if (!settings.viewportFill) {
            resizeCanvas();
        }
    });

    document.getElementById('height-slider').addEventListener('input', (e) => {
        settings.canvasHeight = parseInt(e.target.value);
        document.getElementById('height-value').textContent = settings.canvasHeight + 'px';
        if (!settings.viewportFill) {
            resizeCanvas();
        }
    });

    document.getElementById('stroke-width-slider').addEventListener('input', (e) => {
        settings.strokeWidth = parseInt(e.target.value);
        document.getElementById('stroke-width-value').textContent = settings.strokeWidth + 'px';
        render();
    });

    // Toggles
    document.getElementById('invert-rotation').addEventListener('change', (e) => {
        settings.invertRotation = e.target.checked;
        // Update hovered cells
        grid.forEach(cell => {
            if (cell.isHovered) {
                cell.shouldReturn = false; // Cancel any pending return
                cell.startRotation = cell.rotation;
                cell.targetRotation = getTargetRotation(cell.entrySide);
                cell.animationProgress = 0;
            }
        });
        render();
    });

    document.getElementById('animation-toggle').addEventListener('change', (e) => {
        settings.animationEnabled = e.target.checked;
    });

    document.getElementById('return-on-leave').addEventListener('change', (e) => {
        settings.returnOnLeave = e.target.checked;
        // If disabled, cancel any pending returns
        if (!settings.returnOnLeave) {
            grid.forEach(cell => {
                if (cell.shouldReturn) {
                    cell.shouldReturn = false;
                }
            });
        }
    });

    document.getElementById('animation-type').addEventListener('change', (e) => {
        settings.animationType = e.target.value;
    });

    document.getElementById('viewport-fill').addEventListener('change', (e) => {
        settings.viewportFill = e.target.checked;
        document.getElementById('canvas-width-group').style.display = e.target.checked ? 'none' : 'block';
        document.getElementById('canvas-height-group').style.display = e.target.checked ? 'none' : 'block';
        resizeCanvas();
    });

    // Color picker
    document.getElementById('stroke-color').addEventListener('input', (e) => {
        settings.strokeColor = e.target.value;
        render();
    });

    // Symbol select
    document.getElementById('symbol-select').addEventListener('change', (e) => {
        settings.currentSymbol = e.target.value;
        render();
    });

    // Mouse events
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Window resize
    window.addEventListener('resize', () => {
        if (settings.viewportFill) {
            resizeCanvas();
        }
    });
}

// Initialize
function init() {
    // Initialize canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    initSymbolSelect();
    resizeCanvas();
    setupEventListeners();
    render();
    animate();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

