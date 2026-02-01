// Terminal Emulator for Linux Educational Tool

class Terminal {
    constructor() {
        this.outputEl = document.getElementById('output');
        this.inputEl = document.getElementById('commandInput');
        this.promptEl = document.getElementById('prompt');
        this.terminalEl = document.getElementById('terminal');

        this.commandHistory = [];
        this.historyIndex = -1;

        this.setupEventListeners();
        this.printWelcome();
        this.updatePrompt();
    }

    setupEventListeners() {
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.inputEl.value);
                this.inputEl.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autoComplete();
            } else if (e.key === 'c' && e.ctrlKey) {
                this.printLine('^C');
                this.inputEl.value = '';
                if (network.isCapturing) {
                    this.stopCapture();
                }
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.clear();
            }
        });

        // Focus input on terminal click
        this.terminalEl.addEventListener('click', () => {
            this.inputEl.focus();
        });
    }

    printWelcome() {
        const welcome = `
<span class="ascii-art">
  _     _                    _____                 _       _
 | |   (_)                  | ____|               | |     | |
 | |    _ _ __  _   ___  __ |  _| _ __ ___  _   _ | | __ _| |_ ___  _ __
 | |   | | '_ \\| | | \\ \\/ / | |_ | '_ \` _ \\| | | || |/ _\` | __/ _ \\| '__|
 | |___| | | | | |_| |>  <  |  __|| | | | | | |_| || | (_| | || (_) | |
 |_____|_|_| |_|\\__,_/_/\\_\\ |____||_| |_| |_|\\__,_||_|\\__,_|\\__\\___/|_|
</span>
<span class="output-success">Vítejte v Linux Emulátoru pro výuku!</span>
<span class="output-muted">───────────────────────────────────────────────────────────────</span>

Tento interaktivní terminál vám pomůže pochopit:
• Základy příkazové řádky Linuxu
• Síťové příkazy a diagnostiku
• Bezpečnost HTTP vs HTTPS

Napište <span class="output-command">help</span> pro seznam dostupných příkazů.
Vyzkoušejte scénáře v pravém panelu pro interaktivní demonstrace.

<span class="output-muted">───────────────────────────────────────────────────────────────</span>
`;
        this.printHtml(welcome);
    }

    updatePrompt() {
        this.promptEl.textContent = fs.getPrompt();
        document.querySelector('.terminal-title').textContent = `${fs.user}@${fs.hostname}: ${fs.pwd()}`;
    }

    printLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        line.textContent = text;
        this.outputEl.appendChild(line);
        this.scrollToBottom();
    }

    printHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    }

    printError(text) {
        this.printLine(text, 'output-error');
    }

    printSuccess(text) {
        this.printLine(text, 'output-success');
    }

    scrollToBottom() {
        this.terminalEl.scrollTop = this.terminalEl.scrollHeight;
    }

    clear() {
        this.outputEl.innerHTML = '';
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        this.historyIndex += direction;

        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.inputEl.value = '';
            return;
        }

        this.inputEl.value = this.commandHistory[this.historyIndex];
    }

    autoComplete() {
        const input = this.inputEl.value;
        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];

        if (parts.length === 1) {
            // Complete command
            const commands = Object.keys(this.commands);
            const matches = commands.filter(c => c.startsWith(lastPart));
            if (matches.length === 1) {
                this.inputEl.value = matches[0] + ' ';
            } else if (matches.length > 1) {
                this.printLine(fs.getPrompt() + ' ' + input);
                this.printLine(matches.join('  '));
            }
        } else {
            // Complete path
            const pathParts = lastPart.split('/');
            const searchName = pathParts.pop();
            const searchDir = pathParts.join('/') || '.';

            const result = fs.listDir(searchDir, { all: true });
            if (!result.error) {
                const matches = result.files
                    .filter(f => f.name.startsWith(searchName))
                    .map(f => f.name + (f.type === 'dir' ? '/' : ''));

                if (matches.length === 1) {
                    parts[parts.length - 1] = (pathParts.length > 0 ? pathParts.join('/') + '/' : '') + matches[0];
                    this.inputEl.value = parts.join(' ');
                } else if (matches.length > 1) {
                    this.printLine(fs.getPrompt() + ' ' + input);
                    this.printLine(matches.join('  '));
                }
            }
        }
    }

    executeCommand(input) {
        const trimmedInput = input.trim();

        // Print command
        this.printHtml(`<span class="prompt">${fs.getPrompt()}</span> <span class="output-command">${this.escapeHtml(trimmedInput)}</span>`);

        if (!trimmedInput) return;

        // Add to history
        this.commandHistory.push(trimmedInput);
        this.historyIndex = this.commandHistory.length;

        // Parse command
        const parts = this.parseCommand(trimmedInput);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Execute
        if (this.commands[command]) {
            try {
                this.commands[command].call(this, args);
            } catch (e) {
                this.printError(`Chyba při provádění příkazu: ${e.message}`);
            }
        } else {
            this.printError(`${command}: příkaz nenalezen`);
            this.printLine(`Napište 'help' pro seznam dostupných příkazů.`, 'output-muted');
        }

        this.updatePrompt();
    }

    parseCommand(input) {
        const parts = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (const char of input) {
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            } else if (char === ' ' && !inQuotes) {
                if (current) {
                    parts.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current) {
            parts.push(current);
        }

        return parts;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Command implementations
    commands = {
        help: function() {
            const help = `
<span class="output-info">Dostupné příkazy:</span>

<span class="output-highlight">Souborový systém:</span>
  <span class="output-command">ls</span> [-la] [cesta]     Výpis obsahu adresáře
  <span class="output-command">cd</span> [adresář]         Změna aktuálního adresáře
  <span class="output-command">pwd</span>                  Zobrazí aktuální cestu
  <span class="output-command">cat</span> [soubor]         Zobrazí obsah souboru
  <span class="output-command">mkdir</span> [název]        Vytvoří nový adresář
  <span class="output-command">touch</span> [soubor]       Vytvoří prázdný soubor
  <span class="output-command">rm</span> [-r] [soubor]     Smaže soubor nebo adresář

<span class="output-highlight">Síťové příkazy:</span>
  <span class="output-command">ping</span> [host]          Test síťového spojení
  <span class="output-command">ifconfig</span>             Zobrazí síťová rozhraní
  <span class="output-command">ip addr</span>              Alternativa k ifconfig
  <span class="output-command">nslookup</span> [doména]    DNS lookup
  <span class="output-command">curl</span> [url]           HTTP požadavek
  <span class="output-command">netstat</span>              Aktivní síťová spojení
  <span class="output-command">traceroute</span> [host]    Trasování cesty paketů

<span class="output-highlight">Zachytávání provozu:</span>
  <span class="output-command">tcpdump</span>              Spustí zachytávání paketů
  <span class="output-command">tcpdump stop</span>         Zastaví zachytávání

<span class="output-highlight">Bezpečnostní demonstrace:</span>
  <span class="output-command">http-login</span> [host] [user] [pass]   Simulace HTTP přihlášení
  <span class="output-command">https-login</span> [host] [user] [pass]  Simulace HTTPS přihlášení

<span class="output-highlight">Ostatní:</span>
  <span class="output-command">clear</span>                Vyčistí obrazovku
  <span class="output-command">whoami</span>               Zobrazí aktuálního uživatele
  <span class="output-command">hostname</span>             Zobrazí název počítače
  <span class="output-command">date</span>                 Zobrazí aktuální datum a čas
  <span class="output-command">echo</span> [text]          Vypíše text
  <span class="output-command">history</span>              Historie příkazů

<span class="output-muted">Tip: Použijte Tab pro automatické doplňování, ↑↓ pro historii</span>
`;
            this.printHtml(help);
        },

        ls: function(args) {
            const options = { all: false, long: false };
            let path = '';

            for (const arg of args) {
                if (arg.startsWith('-')) {
                    if (arg.includes('a')) options.all = true;
                    if (arg.includes('l')) options.long = true;
                } else {
                    path = arg;
                }
            }

            const result = fs.listDir(path, options);

            if (result.error) {
                this.printError(result.error);
                return;
            }

            if (result.files.length === 0) {
                return; // Empty directory
            }

            if (options.long) {
                for (const file of result.files) {
                    const size = (file.size || 0).toString().padStart(8);
                    const className = file.type === 'dir' ? 'output-dir' :
                        (file.permissions.includes('x') ? 'output-exec' : 'output-file');
                    this.printHtml(
                        `<span class="output-muted">${file.permissions} ${file.owner.padEnd(8)} ${file.group.padEnd(8)} ${size}</span> ` +
                        `<span class="${className}">${file.name}${file.type === 'dir' ? '/' : ''}</span>`
                    );
                }
            } else {
                const output = result.files.map(f => {
                    const className = f.type === 'dir' ? 'output-dir' :
                        (f.permissions.includes('x') ? 'output-exec' : 'output-file');
                    return `<span class="${className}">${f.name}${f.type === 'dir' ? '/' : ''}</span>`;
                }).join('  ');
                this.printHtml(output);
            }
        },

        cd: function(args) {
            const result = fs.changeDir(args[0]);
            if (result.error) {
                this.printError(result.error);
            }
        },

        pwd: function() {
            this.printLine(fs.pwd());
        },

        cat: function(args) {
            if (args.length === 0) {
                this.printError('cat: chybí operand');
                return;
            }

            const result = fs.readFile(args[0]);
            if (result.error) {
                this.printError(result.error);
            } else {
                this.printLine(result.content);
            }
        },

        mkdir: function(args) {
            if (args.length === 0) {
                this.printError('mkdir: chybí operand');
                return;
            }

            const result = fs.makeDir(args[0]);
            if (result.error) {
                this.printError(result.error);
            }
        },

        touch: function(args) {
            if (args.length === 0) {
                this.printError('touch: chybí operand');
                return;
            }

            const result = fs.touchFile(args[0]);
            if (result.error) {
                this.printError(result.error);
            }
        },

        rm: function(args) {
            const options = { recursive: false };
            let path = '';

            for (const arg of args) {
                if (arg === '-r' || arg === '-rf' || arg === '-R') {
                    options.recursive = true;
                } else {
                    path = arg;
                }
            }

            if (!path) {
                this.printError('rm: chybí operand');
                return;
            }

            const result = fs.remove(path, options);
            if (result.error) {
                this.printError(result.error);
            }
        },

        clear: function() {
            this.clear();
        },

        whoami: function() {
            this.printLine(fs.user);
        },

        hostname: function() {
            this.printLine(fs.hostname);
        },

        date: function() {
            this.printLine(new Date().toLocaleString('cs-CZ'));
        },

        echo: function(args) {
            this.printLine(args.join(' '));
        },

        history: function() {
            this.commandHistory.forEach((cmd, i) => {
                this.printLine(`  ${(i + 1).toString().padStart(4)}  ${cmd}`);
            });
        },

        // Network commands
        ping: function(args) {
            if (args.length === 0) {
                this.printError('ping: chybí cílový hostitel');
                return;
            }

            const count = args.includes('-c') ? parseInt(args[args.indexOf('-c') + 1]) || 4 : 4;
            const host = args.filter(a => !a.startsWith('-') && isNaN(a))[0];

            const result = network.ping(host, count);
            if (result.error) {
                this.printError(result.error);
            } else {
                this.printLine(result.output);
            }
        },

        ifconfig: function(args) {
            const result = network.ifconfig(args[0]);
            if (result.error) {
                this.printError(result.error);
            } else {
                this.printLine(result.output);
            }
        },

        ip: function(args) {
            if (args[0] === 'addr' || args[0] === 'a') {
                const result = network.ipAddr();
                this.printLine(result.output);
            } else {
                this.printError(`ip: neznámý příkaz '${args[0]}'`);
            }
        },

        nslookup: function(args) {
            if (args.length === 0) {
                this.printError('nslookup: chybí argument');
                return;
            }

            const result = network.nslookup(args[0]);
            if (result.error) {
                this.printError(result.error);
            } else {
                this.printLine(result.output);
            }
        },

        curl: function(args) {
            if (args.length === 0) {
                this.printError('curl: chybí URL');
                return;
            }

            const options = { includeHeaders: args.includes('-i') || args.includes('-I') };
            const url = args.find(a => a.startsWith('http'));

            if (!url) {
                this.printError('curl: neplatná URL');
                return;
            }

            const result = network.curl(url, options);
            if (result.error) {
                this.printError(result.error);
            } else {
                this.printLine(result.output);
            }
        },

        netstat: function() {
            const result = network.netstat();
            this.printLine(result.output);
        },

        traceroute: function(args) {
            if (args.length === 0) {
                this.printError('traceroute: chybí cílový hostitel');
                return;
            }

            const result = network.traceroute(args[0]);
            if (result.error) {
                this.printError(result.error);
            } else {
                this.printLine(result.output);
            }
        },

        tcpdump: function(args) {
            if (args[0] === 'stop') {
                this.stopCapture();
                return;
            }

            if (network.isCapturing) {
                this.printLine('tcpdump: již běží zachytávání');
                return;
            }

            // Show network monitor
            document.getElementById('networkMonitor').classList.add('visible');
            document.getElementById('packetList').innerHTML = '';

            const result = network.startCapture((packet) => {
                this.addPacketToMonitor(packet);
            });

            this.printLine(result.output);
            this.printLine('Zachytávání spuštěno. Pro zastavení použijte "tcpdump stop" nebo Ctrl+C');
        },

        // Security demonstration commands
        'http-login': function(args) {
            if (args.length < 3) {
                this.printError('Použití: http-login [host] [username] [password]');
                return;
            }

            const [host, username, password] = args;
            const url = `http://${host}/login`;

            this.printLine(`Odesílám přihlašovací údaje na ${url}...`, 'output-warning');

            network.httpPost(url, { username, password });

            this.printHtml(`
<span class="output-error">⚠ VAROVÁNÍ: Přihlašovací údaje byly odeslány přes HTTP!</span>
<span class="output-error">⚠ Data jsou viditelná v Network Monitoru jako plain text!</span>
`);
        },

        'https-login': function(args) {
            if (args.length < 3) {
                this.printError('Použití: https-login [host] [username] [password]');
                return;
            }

            const [host, username, password] = args;
            const url = `https://${host}/login`;

            this.printLine(`Odesílám přihlašovací údaje na ${url}...`, 'output-success');

            network.httpPost(url, { username, password });

            this.printHtml(`
<span class="output-success">✓ Přihlašovací údaje byly odeslány přes HTTPS</span>
<span class="output-success">✓ Data jsou šifrovaná - v Network Monitoru vidíte pouze "Application Data (encrypted)"</span>
`);
        },

        // Aliases
        ll: function(args) {
            this.commands.ls.call(this, ['-la', ...args]);
        },

        la: function(args) {
            this.commands.ls.call(this, ['-a', ...args]);
        }
    };

    addPacketToMonitor(packet) {
        const packetList = document.getElementById('packetList');
        const packetEl = document.createElement('div');
        packetEl.className = `packet ${packet.type}`;

        const dataClass = packet.sensitive ? 'sensitive' : (packet.encrypted ? 'encrypted' : '');

        packetEl.innerHTML = `
            <span class="packet-time">${packet.timestamp}</span>
            <span class="packet-src">${packet.src}</span>
            <span class="packet-dst">${packet.dst}</span>
            <span class="packet-data ${dataClass}">${packet.data}</span>
        `;

        packetList.appendChild(packetEl);
        packetList.scrollTop = packetList.scrollHeight;
    }

    stopCapture() {
        const result = network.stopCapture();
        this.printLine(result.output);
        document.getElementById('monitorStatus').textContent = '● Zastaveno';
        document.getElementById('monitorStatus').style.color = 'var(--text-muted)';
    }
}

// Global function to stop capture (called from HTML button)
function stopCapture() {
    terminal.stopCapture();
}

// Global function to insert command (called from HTML)
function insertCommand(cmd) {
    const input = document.getElementById('commandInput');
    input.value = cmd;
    input.focus();
}

// Initialize terminal
const terminal = new Terminal();
