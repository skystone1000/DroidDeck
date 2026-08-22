/* ==========================================================================
   SVG diagram renderer — flowchart, animated step list, sequence diagram.

   Everything is drawn with raw SVG and coloured through CSS custom properties
   so diagrams follow the active theme without being redrawn.
   ========================================================================== */

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const key in attrs) {
        // Callers pass null for optional attributes (e.g. stroke-dasharray);
        // setAttribute would otherwise stringify it to "null".
        if (attrs[key] === null || attrs[key] === undefined) continue;
        node.setAttribute(key, attrs[key]);
    }
    return node;
}

/** Wraps `text` to at most `max` characters per line, at word boundaries. */
function wrapLabel(text, max) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
        if (line && (line + ' ' + word).length > max) {
            lines.push(line);
            line = word;
        } else {
            line = line ? line + ' ' + word : word;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function addText(parent, lines, x, y, options) {
    const opts = options || {};
    const lineHeight = opts.lineHeight || 13;
    const offset = (lines.length - 1) * lineHeight / 2;
    const text = el('text', {
        x: x,
        y: y - offset,
        'text-anchor': opts.anchor || 'middle',
        'dominant-baseline': 'middle',
        'font-size': opts.size || 11.5,
        'font-family': 'var(--font-sans)',
        'font-weight': opts.weight || 500,
        fill: opts.fill || 'var(--diagram-text)'
    });
    lines.forEach((line, i) => {
        const tspan = el('tspan', { x: x, dy: i === 0 ? 0 : lineHeight });
        tspan.textContent = line;
        text.appendChild(tspan);
    });
    parent.appendChild(text);
    return text;
}

/** Shared <defs> holding the arrowhead marker. Ids are namespaced per-svg. */
function addArrowMarker(svg, id) {
    const defs = el('defs', {});
    const marker = el('marker', {
        id: id,
        viewBox: '0 0 10 10',
        refX: 9,
        refY: 5,
        markerWidth: 6,
        markerHeight: 6,
        orient: 'auto-start-reverse'
    });
    marker.appendChild(el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: 'var(--diagram-arrow)' }));
    defs.appendChild(marker);
    svg.appendChild(defs);
}

function makeSvg(width, height) {
    return el('svg', {
        viewBox: `0 0 ${width} ${height}`,
        width: width,
        height: height,
        role: 'img',
        xmlns: SVG_NS
    });
}

function addDiagramTitle(container, title) {
    if (!title) return;
    const heading = document.createElement('div');
    heading.className = 'diagram-title';
    heading.textContent = title;
    container.appendChild(heading);
}

/* --------------------------------------------------------------------------
   Dispatcher
   -------------------------------------------------------------------------- */

function renderDiagram(container, config, type) {
    if (!container || !config) return;
    container.innerHTML = '';
    switch (type) {
        case 'flowchart': return renderFlowchart(container, config);
        case 'animation': return renderAnimatedDiagram(container, config);
        case 'sequence':  return renderSequenceDiagram(container, config);
        default:          return;
    }
}

/* --------------------------------------------------------------------------
   Flowchart — grid of nodes joined by arrows
   config: { nodes: [{label, type}], connections: [{from, to}], columns, title }
   -------------------------------------------------------------------------- */

function renderFlowchart(container, config) {
    const nodes = config.nodes || [];
    const connections = config.connections || [];
    const columns = config.columns || Math.min(nodes.length, 3);
    const rows = Math.ceil(nodes.length / columns);

    const nodeWidth = 160;
    const nodeHeight = 50;
    const gapX = 44;
    const gapY = 46;
    const pad = 16;

    const width = pad * 2 + columns * nodeWidth + (columns - 1) * gapX;
    const height = pad * 2 + rows * nodeHeight + (rows - 1) * gapY;

    addDiagramTitle(container, config.title);

    const svg = makeSvg(width, height);
    const markerId = `arrow-${Math.random().toString(36).slice(2, 9)}`;
    addArrowMarker(svg, markerId);

    // Centre of each node, indexed the same as `nodes`
    const centres = nodes.map((_, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        return {
            x: pad + col * (nodeWidth + gapX) + nodeWidth / 2,
            y: pad + row * (nodeHeight + gapY) + nodeHeight / 2
        };
    });

    // Connections first so nodes paint over the line ends
    const lines = el('g', { class: 'diagram-connections' });
    connections.forEach((conn) => {
        const from = centres[conn.from];
        const to = centres[conn.to];
        if (!from || !to) return;
        const [start, end] = trimToEdges(from, to, nodeWidth, nodeHeight);
        lines.appendChild(el('line', {
            class: 'diagram-line',
            x1: start.x, y1: start.y, x2: end.x, y2: end.y,
            stroke: 'var(--diagram-arrow)',
            'stroke-width': 1.6,
            'marker-end': `url(#${markerId})`
        }));
        if (conn.label) {
            addText(lines, [conn.label], (start.x + end.x) / 2, (start.y + end.y) / 2 - 8, {
                size: 10, fill: 'var(--diagram-text)'
            });
        }
    });
    svg.appendChild(lines);

    nodes.forEach((node, i) => {
        const { x, y } = centres[i];
        const group = el('g', { class: 'diagram-node' });
        group.appendChild(makeNodeShape(node.type, x, y, nodeWidth, nodeHeight));
        addText(group, wrapLabel(node.label, 22), x, y);
        svg.appendChild(group);
    });

    container.appendChild(svg);
}

function makeNodeShape(type, cx, cy, w, h) {
    const x = cx - w / 2;
    const y = cy - h / 2;
    const common = {
        fill: 'var(--diagram-node)',
        stroke: 'var(--diagram-border)',
        'stroke-width': 1.4
    };

    if (type === 'decision') {
        const points = [
            `${cx},${y}`, `${x + w},${cy}`, `${cx},${y + h}`, `${x},${cy}`
        ].join(' ');
        return el('polygon', Object.assign({ points }, common));
    }

    const radius = type === 'terminal' ? h / 2 : 10;
    return el('rect', Object.assign({ x, y, width: w, height: h, rx: radius, ry: radius }, common));
}

/**
 * Pulls a connector's endpoints back to the boundary of each node box so the
 * arrowhead lands on the edge rather than being buried under the shape.
 */
function trimToEdges(from, to, w, h) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const shrink = (point, sign) => {
        if (dx === 0 && dy === 0) return point;
        // Scale to whichever axis leaves the box first
        const scaleX = dx === 0 ? Infinity : (w / 2 + 2) / Math.abs(dx);
        const scaleY = dy === 0 ? Infinity : (h / 2 + 2) / Math.abs(dy);
        const scale = Math.min(scaleX, scaleY);
        return { x: point.x + sign * dx * scale, y: point.y + sign * dy * scale };
    };
    return [shrink(from, 1), shrink(to, -1)];
}

/* --------------------------------------------------------------------------
   Animated diagram — vertical numbered steps
   config: { steps: string[], title }
   -------------------------------------------------------------------------- */

function renderAnimatedDiagram(container, config) {
    const steps = config.steps || [];
    const boxWidth = 300;
    const boxHeight = 40;
    const gap = 30;
    const pad = 16;

    const width = boxWidth + pad * 2;
    const height = pad * 2 + steps.length * boxHeight + Math.max(0, steps.length - 1) * gap;

    addDiagramTitle(container, config.title);

    const svg = makeSvg(width, height);
    svg.setAttribute('class', 'diagram-animated');
    const markerId = `arrow-${Math.random().toString(36).slice(2, 9)}`;
    addArrowMarker(svg, markerId);

    steps.forEach((step, i) => {
        const top = pad + i * (boxHeight + gap);
        const centreY = top + boxHeight / 2;

        // Connector down from the previous box
        if (i > 0) {
            svg.appendChild(el('line', {
                class: 'diagram-line flow-arrow',
                x1: width / 2, y1: top - gap,
                x2: width / 2, y2: top - 4,
                stroke: 'var(--diagram-arrow)',
                'stroke-width': 1.6,
                'marker-end': `url(#${markerId})`
            }));
        }

        const group = el('g', { class: 'diagram-node' });
        group.appendChild(el('rect', {
            x: pad, y: top, width: boxWidth, height: boxHeight, rx: 10, ry: 10,
            fill: 'var(--diagram-node)',
            stroke: 'var(--diagram-border)',
            'stroke-width': 1.4
        }));
        group.appendChild(el('circle', {
            cx: pad + 22, cy: centreY, r: 11,
            fill: 'var(--diagram-arrow)', opacity: 0.9
        }));
        addText(group, [String(i + 1)], pad + 22, centreY, { size: 11, weight: 600, fill: '#fff' });
        addText(group, wrapLabel(step, 38), pad + 46, centreY, {
            anchor: 'start', lineHeight: 12, size: 11.5
        });
        svg.appendChild(group);
    });

    container.appendChild(svg);
}

/* --------------------------------------------------------------------------
   Sequence diagram — actors with lifelines and messages between them
   config: { actors: string[], messages: [{from, to, label, dashed}], title }
   -------------------------------------------------------------------------- */

function renderSequenceDiagram(container, config) {
    const actors = config.actors || [];
    const messages = config.messages || [];

    const actorWidth = 120;
    const actorHeight = 36;
    const gapX = 40;
    const messageGap = 46;
    const pad = 16;
    const topOffset = pad + actorHeight + 30;

    const width = pad * 2 + actors.length * actorWidth + Math.max(0, actors.length - 1) * gapX;
    const height = topOffset + messages.length * messageGap + pad + 10;

    addDiagramTitle(container, config.title);

    const svg = makeSvg(width, height);
    const markerId = `arrow-${Math.random().toString(36).slice(2, 9)}`;
    addArrowMarker(svg, markerId);

    const lanes = actors.map((_, i) => pad + i * (actorWidth + gapX) + actorWidth / 2);

    // Lifelines
    lanes.forEach((x) => {
        svg.appendChild(el('line', {
            x1: x, y1: pad + actorHeight, x2: x, y2: height - pad,
            stroke: 'var(--diagram-border)',
            'stroke-width': 1,
            'stroke-dasharray': '4 4',
            opacity: 0.6
        }));
    });

    // Actor boxes
    actors.forEach((actor, i) => {
        const group = el('g', { class: 'diagram-node' });
        group.appendChild(el('rect', {
            x: lanes[i] - actorWidth / 2, y: pad,
            width: actorWidth, height: actorHeight, rx: 8, ry: 8,
            fill: 'var(--diagram-node)',
            stroke: 'var(--diagram-border)',
            'stroke-width': 1.4
        }));
        addText(group, wrapLabel(actor, 18), lanes[i], pad + actorHeight / 2, { weight: 600 });
        svg.appendChild(group);
    });

    // Messages
    messages.forEach((message, i) => {
        const y = topOffset + i * messageGap;
        const fromX = lanes[message.from];
        const toX = lanes[message.to];
        if (fromX === undefined || toX === undefined) return;

        if (message.from === message.to) {
            // Self-call: a small loop hanging off the right of the lifeline
            const path = `M ${fromX} ${y} h 26 v 18 h -26`;
            svg.appendChild(el('path', {
                d: path, fill: 'none',
                stroke: 'var(--diagram-arrow)',
                'stroke-width': 1.5,
                'stroke-dasharray': message.dashed ? '5 4' : null,
                'marker-end': `url(#${markerId})`
            }));
            addText(svg, [message.label], fromX + 34, y + 9, { anchor: 'start', size: 10.5 });
            return;
        }

        const direction = toX > fromX ? -1 : 1;
        svg.appendChild(el('line', {
            x1: fromX, y1: y, x2: toX + direction * 4, y2: y,
            stroke: 'var(--diagram-arrow)',
            'stroke-width': 1.5,
            'stroke-dasharray': message.dashed ? '5 4' : null,
            'marker-end': `url(#${markerId})`
        }));
        addText(svg, [message.label], (fromX + toX) / 2, y - 9, { size: 10.5 });
    });

    container.appendChild(svg);
}
