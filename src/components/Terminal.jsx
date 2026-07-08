import React, { useState, useRef, useEffect } from 'react';

export default function Terminal() {
    const [history, setHistory] = useState([
        { type: 'output', content: 'Welcome! Type <span class="cmd-highlight">help</span> to see available commands.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const terminalEndRef = useRef(null);

    const commands = {
        help: 'Available commands:\n  <span class="cmd-highlight">about</span>    - Brief intro\n  <span class="cmd-highlight">skills</span>   - Design & video stacks\n  <span class="cmd-highlight">projects</span> - View top works\n  <span class="cmd-highlight">contact</span>  - Connect details\n  <span class="cmd-highlight">clear</span>    - Reset output screen',
        about: 'Lauza is a creative designer and video editor specializing in crafting highly-interactive, responsive UI designs and premium edits with a modern SaaS approach.',
        skills: 'Design Stacks: Figma, UI/UX Design, Photoshop.\nEditing Stacks: Premiere Pro, After Effects.\nDev: HTML, CSS, JavaScript.',
        projects: 'Top Projects Showcase:\n1. SaaS Dashboard Design (Figma)\n2. Dynamic Motion Graphics Promo Teaser (After Effects)\n3. Modern Web Portfolio Hub (Static Web)',
        contact: 'Let\'s collaborate! Reach me at:\nEmail: <span class="cmd-highlight">lauza@example.com</span>\nInstagram/YouTube: @lauzadesigns'
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const rawVal = inputValue;
            const cleanVal = rawVal.trim().toLowerCase();
            
            if (cleanVal === '') {
                setHistory(prev => [...prev, { type: 'input', content: '' }]);
                setInputValue('');
                return;
            }

            if (cleanVal === 'clear') {
                setHistory([]);
                setInputValue('');
                return;
            }

            const newHistory = [...history, { type: 'input', content: rawVal }];

            if (commands[cleanVal]) {
                newHistory.push({ type: 'output', content: commands[cleanVal] });
            } else {
                newHistory.push({ 
                    type: 'output', 
                    content: `Command not found: "${rawVal}". Type <span class="cmd-highlight">help</span> for a list of commands.` 
                });
            }

            setHistory(newHistory);
            setInputValue('');
        }
    };

    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    return (
        <div className="terminal-container">
            <div className="terminal-header">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
                <span className="terminal-title">lauza@portfolio: ~</span>
            </div>
            <div className="terminal-body" onClick={() => document.getElementById('term-input')?.focus()}>
                {history.map((line, index) => (
                    <div key={index} className="terminal-output">
                        {line.type === 'input' ? (
                            <>
                                <span className="terminal-prompt">lauza$</span> {line.content}
                            </>
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: line.content.replace(/\n/g, '<br>') }} />
                        )}
                    </div>
                ))}
                
                <div className="terminal-input-line">
                    <span className="terminal-prompt">lauza$</span>
                    <input 
                        type="text" 
                        id="term-input" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off" 
                        placeholder=""
                    />
                </div>
                <div ref={terminalEndRef} />
            </div>
        </div>
    );
}
