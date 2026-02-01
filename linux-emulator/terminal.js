// Terminal Emulator for Linux Educational Tool

class Terminal {
    constructor() {
        this.outputEl = document.getElementById('output');
        this.inputEl = document.getElementById('commandInput');
        this.promptEl = document.getElementById('prompt');
        this.terminalEl = document.getElementById('terminal');
        this.titleEl = document.getElementById('terminalTitle');

        this.commandHistory = [];
        this.historyIndex = -1;
        this.awaitingSudoPassword = false;
        this.sudoCommand = null;

        this.setupEventListeners();
        this.printWelcome();
        this.updatePrompt();
    }

    setupEventListeners() {
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (this.awaitingSudoPassword) {
                    this.handleSudoPassword(this.inputEl.value);
                } else {
                    this.executeCommand(this.inputEl.value);
                }
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
        const welcome = `<span class="output-success">Linux Emulator v1.0</span>
<span class="output-muted">Napiš</span> <span class="output-cyan">help</span> <span class="output-muted">pro seznam příkazů nebo</span> <span class="output-cyan">cat readme.txt</span> <span class="output-muted">pro začátek.</span>
`;
        this.printHtml(welcome);
    }

    updatePrompt() {
        this.promptEl.textContent = fs.getPrompt();
        this.promptEl.classList.toggle('root', fs.isRoot);
        const displayUser = fs.isRoot ? 'root' : fs.user;
        this.titleEl.textContent = `${displayUser}@${fs.hostname}: ${fs.pwd()}`;
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

    handleSudoPassword(password) {
        this.inputEl.type = 'text';
        this.awaitingSudoPassword = false;

        const result = fs.trySudo(password);

        if (result.error) {
            this.printError(result.error);
            this.sudoCommand = null;
            return;
        }

        // Password correct!
        const args = this.sudoCommand;
        this.sudoCommand = null;

        if (args[0].toLowerCase() === 'su') {
            // Stay as root
            this.printSuccess('Přepnuto do režimu superuživatele. Pro návrat napiš "exit".');
            this.updatePrompt();
        } else {
            // Run single command as root
            const command = args[0].toLowerCase();
            const cmdArgs = args.slice(1);

            if (this.commands[command]) {
                this.commands[command].call(this, cmdArgs);
            } else {
                this.printError(`${command}: příkaz nenalezen`);
            }

            // Return to normal user after single command
            fs.exitSudo();
        }
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
        this.printHtml(`<span class="prompt">${fs.getPrompt()}</span> ${this.escapeHtml(trimmedInput)}`);

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
                this.printError(`Chyba: ${e.message}`);
            }
        } else {
            this.printError(`${command}: příkaz nenalezen`);
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

    // Manual pages
    manPages = {
        ls: {
            name: 'ls',
            synopsis: 'ls [VOLBY]... [SOUBOR]...',
            description: 'Vypíše informace o souborech (standardně v aktuálním adresáři).',
            options: [
                ['-a, --all', 'nezakrývat položky začínající na .'],
                ['-l', 'použít dlouhý formát výpisu'],
                ['-la', 'kombinace -l a -a']
            ]
        },
        cd: {
            name: 'cd',
            synopsis: 'cd [adresář]',
            description: 'Změní aktuální pracovní adresář na zadaný adresář. Bez argumentu přejde do domovského adresáře.',
            options: [
                ['..', 'přejít do nadřazeného adresáře'],
                ['~', 'přejít do domovského adresáře'],
                ['-', 'přejít do předchozího adresáře']
            ]
        },
        pwd: {
            name: 'pwd',
            synopsis: 'pwd',
            description: 'Vypíše úplnou cestu k aktuálnímu pracovnímu adresáři.',
            options: []
        },
        cat: {
            name: 'cat',
            synopsis: 'cat [SOUBOR]...',
            description: 'Spojí soubory a vypíše je na standardní výstup.',
            options: []
        },
        grep: {
            name: 'grep',
            synopsis: 'grep [VOLBY] VZOR [SOUBOR]...',
            description: 'Hledá ve vstupních souborech řádky odpovídající zadanému vzoru.',
            options: [
                ['-i', 'ignorovat rozdíl mezi velkými a malými písmeny'],
                ['-r', 'rekurzivně prohledat adresáře'],
                ['-n', 'zobrazit čísla řádků']
            ]
        },
        mkdir: {
            name: 'mkdir',
            synopsis: 'mkdir ADRESÁŘ...',
            description: 'Vytvoří adresáře, pokud ještě neexistují.',
            options: []
        },
        rm: {
            name: 'rm',
            synopsis: 'rm [VOLBY]... SOUBOR...',
            description: 'Odstraní soubory nebo adresáře.',
            options: [
                ['-r, -R', 'rekurzivně odstranit adresáře a jejich obsah'],
                ['-f', 'ignorovat neexistující soubory']
            ]
        },
        touch: {
            name: 'touch',
            synopsis: 'touch SOUBOR...',
            description: 'Aktualizuje čas přístupu a modifikace souboru. Pokud soubor neexistuje, vytvoří prázdný soubor.',
            options: []
        },
        stat: {
            name: 'stat',
            synopsis: 'stat SOUBOR...',
            description: 'Zobrazí podrobné informace o souboru nebo adresáři.',
            options: []
        },
        file: {
            name: 'file',
            synopsis: 'file SOUBOR...',
            description: 'Určí typ souboru.',
            options: []
        },
        hexdump: {
            name: 'hexdump',
            synopsis: 'hexdump [VOLBY] SOUBOR',
            description: 'Zobrazí obsah souboru v hexadecimálním formátu.',
            options: [
                ['-C', 'kanonický výstup s ASCII reprezentací']
            ]
        },
        head: {
            name: 'head',
            synopsis: 'head [VOLBY] [SOUBOR]...',
            description: 'Vypíše prvních 10 řádků souboru.',
            options: [
                ['-n NUM', 'vypsat prvních NUM řádků']
            ]
        },
        tail: {
            name: 'tail',
            synopsis: 'tail [VOLBY] [SOUBOR]...',
            description: 'Vypíše posledních 10 řádků souboru.',
            options: [
                ['-n NUM', 'vypsat posledních NUM řádků']
            ]
        },
        wc: {
            name: 'wc',
            synopsis: 'wc [VOLBY] [SOUBOR]...',
            description: 'Vypíše počet řádků, slov a bajtů.',
            options: [
                ['-l', 'vypsat pouze počet řádků'],
                ['-w', 'vypsat pouze počet slov'],
                ['-c', 'vypsat pouze počet bajtů']
            ]
        },
        echo: {
            name: 'echo',
            synopsis: 'echo [TEXT]...',
            description: 'Vypíše text na standardní výstup.',
            options: []
        },
        whoami: {
            name: 'whoami',
            synopsis: 'whoami',
            description: 'Vypíše uživatelské jméno aktuálního uživatele.',
            options: []
        },
        uname: {
            name: 'uname',
            synopsis: 'uname [VOLBY]',
            description: 'Vypíše informace o systému.',
            options: [
                ['-a', 'vypsat všechny informace'],
                ['-s', 'název jádra'],
                ['-r', 'verze jádra'],
                ['-m', 'architektura procesoru']
            ]
        },
        uptime: {
            name: 'uptime',
            synopsis: 'uptime',
            description: 'Zobrazí jak dlouho systém běží.',
            options: []
        },
        clear: {
            name: 'clear',
            synopsis: 'clear',
            description: 'Vymaže obrazovku terminálu.',
            options: []
        },
        history: {
            name: 'history',
            synopsis: 'history',
            description: 'Zobrazí historii zadaných příkazů.',
            options: []
        },
        help: {
            name: 'help',
            synopsis: 'help',
            description: 'Zobrazí seznam dostupných příkazů.',
            options: []
        },
        find: {
            name: 'find',
            synopsis: 'find [cesta] [výraz]',
            description: 'Hledá soubory v adresářové struktuře.',
            options: [
                ['-name VZOR', 'hledá soubory podle jména']
            ]
        },
        sudo: {
            name: 'sudo',
            synopsis: 'sudo [příkaz]',
            description: 'Spustí příkaz s právy superuživatele (root). Vyžaduje heslo.',
            options: [
                ['su', 'přepne do režimu root (zůstane jako root)'],
                ['[příkaz]', 'spustí jednorázově příkaz jako root']
            ]
        },
        exit: {
            name: 'exit',
            synopsis: 'exit',
            description: 'Ukončí aktuální shell. V sudo režimu se vrátí k běžnému uživateli.',
            options: []
        },
        id: {
            name: 'id',
            synopsis: 'id',
            description: 'Zobrazí informace o aktuálním uživateli (UID, GID).',
            options: []
        }
    };

    // Command implementations
    commands = {
        help: function() {
            const help = `
<span class="man-section">DOSTUPNÉ PŘÍKAZY</span>

<span class="man-header">Navigace a soubory:</span>
  <span class="man-option">ls</span>       Výpis obsahu adresáře
  <span class="man-option">cd</span>       Změna adresáře
  <span class="man-option">pwd</span>      Aktuální adresář
  <span class="man-option">cat</span>      Zobrazení obsahu souboru
  <span class="man-option">head</span>     Prvních N řádků souboru
  <span class="man-option">tail</span>     Posledních N řádků souboru

<span class="man-header">Práce se soubory:</span>
  <span class="man-option">mkdir</span>    Vytvoření adresáře
  <span class="man-option">touch</span>    Vytvoření souboru
  <span class="man-option">rm</span>       Smazání souboru/adresáře
  <span class="man-option">cp</span>       Kopírování
  <span class="man-option">mv</span>       Přesun/přejmenování

<span class="man-header">Vyhledávání:</span>
  <span class="man-option">grep</span>     Hledání textu v souborech
  <span class="man-option">find</span>     Hledání souborů

<span class="man-header">Informace:</span>
  <span class="man-option">stat</span>     Informace o souboru
  <span class="man-option">file</span>     Typ souboru
  <span class="man-option">wc</span>       Počet řádků/slov/znaků
  <span class="man-option">hexdump</span>  Hexadecimální výpis

<span class="man-header">Systém:</span>
  <span class="man-option">whoami</span>   Aktuální uživatel
  <span class="man-option">id</span>       Informace o uživateli
  <span class="man-option">uname</span>    Informace o systému
  <span class="man-option">uptime</span>   Doba běhu systému
  <span class="man-option">echo</span>     Výpis textu
  <span class="man-option">history</span>  Historie příkazů
  <span class="man-option">clear</span>    Vyčištění obrazovky

<span class="man-header">Oprávnění:</span>
  <span class="man-option">sudo</span>     Spustit příkaz jako root
  <span class="man-option">sudo su</span>  Přepnout do režimu root
  <span class="man-option">exit</span>     Opustit režim root

<span class="output-muted">Pro nápovědu k příkazu: man PŘÍKAZ</span>
<span class="output-muted">Tab = doplnění, ↑↓ = historie, Ctrl+L = clear</span>
`;
            this.printHtml(help);
        },

        man: function(args) {
            if (args.length === 0) {
                this.printError('Jaký manuál chcete zobrazit?');
                return;
            }

            const cmd = args[0].toLowerCase();
            const page = this.manPages[cmd];

            if (!page) {
                this.printError(`Žádný manuál pro ${cmd}`);
                return;
            }

            let output = `
<span class="man-header">${page.name.toUpperCase()}(1)</span>                    User Commands

<span class="man-section">NÁZEV</span>
       ${page.name} - ${page.description.split('.')[0]}

<span class="man-section">POUŽITÍ</span>
       ${page.synopsis}

<span class="man-section">POPIS</span>
       ${page.description}
`;

            if (page.options.length > 0) {
                output += `\n<span class="man-section">VOLBY</span>\n`;
                for (const [opt, desc] of page.options) {
                    output += `       <span class="man-option">${opt}</span>\n              ${desc}\n`;
                }
            }

            this.printHtml(output);
        },

        ls: function(args) {
            const options = { all: false, long: false };
            let path = '';

            for (const arg of args) {
                if (arg.startsWith('-')) {
                    if (arg.includes('a') || arg.includes('A')) options.all = true;
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
                return;
            }

            if (options.long) {
                for (const file of result.files) {
                    const size = (file.size || 0).toString().padStart(8);
                    const dateStr = file.modified ? file.modified.slice(5, 16) : 'Jan  1 00:00';
                    const className = file.type === 'dir' ? 'file-dir' :
                        (file.permissions.includes('x') ? 'file-exec' : 'file-normal');

                    this.printHtml(
                        `<span class="output-muted">${file.permissions} 1 ${file.owner.padEnd(8)} ${file.group.padEnd(8)} ${size} ${dateStr}</span> ` +
                        `<span class="${className}">${file.name}${file.type === 'dir' ? '/' : ''}</span>`
                    );
                }
            } else {
                const output = result.files.map(f => {
                    const className = f.type === 'dir' ? 'file-dir' :
                        (f.permissions.includes('x') ? 'file-exec' : 'file-normal');
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

            for (const arg of args) {
                const result = fs.readFile(arg);
                if (result.error) {
                    this.printError(result.error);
                } else if (result.binary) {
                    this.printError(`cat: ${arg}: Binární soubor (použij hexdump -C)`);
                } else {
                    this.printLine(result.content);
                }
            }
        },

        head: function(args) {
            let lines = 10;
            let file = null;

            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-n' && args[i + 1]) {
                    lines = parseInt(args[i + 1]) || 10;
                    i++;
                } else if (!args[i].startsWith('-')) {
                    file = args[i];
                }
            }

            if (!file) {
                this.printError('head: chybí operand');
                return;
            }

            const result = fs.readFile(file);
            if (result.error) {
                this.printError(result.error);
            } else {
                const content = result.content.split('\n').slice(0, lines).join('\n');
                this.printLine(content);
            }
        },

        tail: function(args) {
            let lines = 10;
            let file = null;

            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-n' && args[i + 1]) {
                    lines = parseInt(args[i + 1]) || 10;
                    i++;
                } else if (!args[i].startsWith('-')) {
                    file = args[i];
                }
            }

            if (!file) {
                this.printError('tail: chybí operand');
                return;
            }

            const result = fs.readFile(file);
            if (result.error) {
                this.printError(result.error);
            } else {
                const allLines = result.content.split('\n');
                const content = allLines.slice(-lines).join('\n');
                this.printLine(content);
            }
        },

        mkdir: function(args) {
            if (args.length === 0) {
                this.printError('mkdir: chybí operand');
                return;
            }

            for (const arg of args) {
                const result = fs.makeDir(arg);
                if (result.error) {
                    this.printError(result.error);
                }
            }
        },

        touch: function(args) {
            if (args.length === 0) {
                this.printError('touch: chybí operand');
                return;
            }

            for (const arg of args) {
                const result = fs.touchFile(arg);
                if (result.error) {
                    this.printError(result.error);
                }
            }
        },

        rm: function(args) {
            const options = { recursive: false };
            const files = [];

            for (const arg of args) {
                if (arg === '-r' || arg === '-rf' || arg === '-R' || arg === '-fr') {
                    options.recursive = true;
                } else if (arg === '-f') {
                    // Force - ignore
                } else if (!arg.startsWith('-')) {
                    files.push(arg);
                }
            }

            if (files.length === 0) {
                this.printError('rm: chybí operand');
                return;
            }

            for (const file of files) {
                const result = fs.remove(file, options);
                if (result.error) {
                    this.printError(result.error);
                }
            }
        },

        grep: function(args) {
            const options = { ignoreCase: false, recursive: false, showLineNum: false };
            let pattern = null;
            const files = [];

            for (const arg of args) {
                if (arg === '-i') {
                    options.ignoreCase = true;
                } else if (arg === '-r' || arg === '-R') {
                    options.recursive = true;
                } else if (arg === '-n') {
                    options.showLineNum = true;
                } else if (!pattern) {
                    pattern = arg;
                } else {
                    files.push(arg);
                }
            }

            if (!pattern) {
                this.printError('grep: chybí vzor');
                return;
            }

            if (files.length === 0) {
                files.push('.');
                options.recursive = true;
            }

            for (const file of files) {
                const result = fs.grep(pattern, file, options);

                if (result.error) {
                    this.printError(result.error);
                } else if (result.results.length === 0) {
                    // No matches - silent
                } else {
                    for (const match of result.results) {
                        const prefix = files.length > 1 || options.recursive
                            ? `<span class="output-highlight">${match.file}</span>:`
                            : '';
                        const lineNum = options.showLineNum
                            ? `<span class="output-success">${match.lineNum}</span>:`
                            : '';

                        // Highlight matches
                        const regex = options.ignoreCase
                            ? new RegExp(`(${pattern})`, 'gi')
                            : new RegExp(`(${pattern})`, 'g');
                        const highlighted = this.escapeHtml(match.line).replace(regex, '<span class="output-error">$1</span>');

                        this.printHtml(`${prefix}${lineNum}${highlighted}`);
                    }
                }
            }
        },

        find: function(args) {
            let searchPath = '.';
            let namePattern = null;

            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-name' && args[i + 1]) {
                    namePattern = args[i + 1];
                    i++;
                } else if (!args[i].startsWith('-')) {
                    searchPath = args[i];
                }
            }

            const findInDir = (path, node) => {
                const results = [];
                const resolvedPath = fs.resolvePath(path);

                for (const [name, child] of Object.entries(node.children || {})) {
                    const childPath = resolvedPath === '/' ? `/${name}` : `${resolvedPath}/${name}`;

                    if (!namePattern || this.matchWildcard(name, namePattern)) {
                        results.push(childPath);
                    }

                    if (child.type === 'dir') {
                        results.push(...findInDir(childPath, child));
                    }
                }

                return results;
            };

            const startNode = fs.getNode(searchPath);
            if (!startNode) {
                this.printError(`find: '${searchPath}': Adresář neexistuje`);
                return;
            }

            if (startNode.type !== 'dir') {
                if (!namePattern || this.matchWildcard(startNode.name, namePattern)) {
                    this.printLine(fs.resolvePath(searchPath));
                }
                return;
            }

            const results = findInDir(searchPath, startNode);
            results.forEach(r => this.printLine(r));
        },

        stat: function(args) {
            if (args.length === 0) {
                this.printError('stat: chybí operand');
                return;
            }

            for (const arg of args) {
                const result = fs.getFileInfo(arg);

                if (result.error) {
                    this.printError(result.error);
                } else {
                    const typeStr = result.type === 'dir' ? 'adresář' : 'běžný soubor';
                    this.printHtml(`  Soubor: <span class="output-cyan">${result.name}</span>
  Velikost: ${result.size}       Bloky: ${result.blocks}       ${typeStr}
Přístup: (${result.permissions})  Uid: ${result.owner}   Gid: ${result.group}
Změněno: ${result.modified}`);
                }
            }
        },

        file: function(args) {
            if (args.length === 0) {
                this.printError('file: chybí operand');
                return;
            }

            for (const arg of args) {
                const result = fs.getFileType(arg);

                if (result.error) {
                    this.printError(result.error);
                } else {
                    this.printLine(`${arg}: ${result.type}`);
                }
            }
        },

        hexdump: function(args) {
            let canonical = false;
            let file = null;

            for (const arg of args) {
                if (arg === '-C') {
                    canonical = true;
                } else if (!arg.startsWith('-')) {
                    file = arg;
                }
            }

            if (!file) {
                this.printError('hexdump: chybí operand');
                return;
            }

            const result = fs.readFile(file);
            if (result.error) {
                this.printError(result.error);
                return;
            }

            const content = result.content;
            const bytes = [];
            for (let i = 0; i < content.length; i++) {
                bytes.push(content.charCodeAt(i));
            }

            // Generate hexdump output
            for (let offset = 0; offset < bytes.length; offset += 16) {
                const chunk = bytes.slice(offset, offset + 16);
                const offsetStr = offset.toString(16).padStart(8, '0');

                const hexPart1 = chunk.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join(' ');
                const hexPart2 = chunk.slice(8).map(b => b.toString(16).padStart(2, '0')).join(' ');

                const asciiPart = chunk.map(b => {
                    if (b >= 32 && b < 127) return String.fromCharCode(b);
                    return '.';
                }).join('');

                if (canonical) {
                    this.printHtml(
                        `<span class="hex-offset">${offsetStr}</span>  ` +
                        `<span class="hex-bytes">${hexPart1.padEnd(23)}</span>  ` +
                        `<span class="hex-bytes">${hexPart2.padEnd(23)}</span>  ` +
                        `|<span class="hex-ascii">${asciiPart}</span>|`
                    );
                } else {
                    this.printHtml(
                        `<span class="hex-offset">${offsetStr}</span>  ` +
                        `<span class="hex-bytes">${hexPart1} ${hexPart2}</span>`
                    );
                }
            }

            const endOffset = bytes.length.toString(16).padStart(8, '0');
            this.printHtml(`<span class="hex-offset">${endOffset}</span>`);
        },

        wc: function(args) {
            let countLines = true, countWords = true, countBytes = true;
            const files = [];

            for (const arg of args) {
                if (arg === '-l') {
                    countLines = true; countWords = false; countBytes = false;
                } else if (arg === '-w') {
                    countLines = false; countWords = true; countBytes = false;
                } else if (arg === '-c') {
                    countLines = false; countWords = false; countBytes = true;
                } else if (!arg.startsWith('-')) {
                    files.push(arg);
                }
            }

            if (files.length === 0) {
                this.printError('wc: chybí operand');
                return;
            }

            for (const file of files) {
                const result = fs.readFile(file);
                if (result.error) {
                    this.printError(result.error);
                    continue;
                }

                const content = result.content;
                const lines = content.split('\n').length;
                const words = content.split(/\s+/).filter(w => w.length > 0).length;
                const bytes = content.length;

                let output = '';
                if (countLines) output += lines.toString().padStart(8);
                if (countWords) output += words.toString().padStart(8);
                if (countBytes) output += bytes.toString().padStart(8);
                output += ' ' + file;

                this.printLine(output);
            }
        },

        echo: function(args) {
            this.printLine(args.join(' '));
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

        uname: function(args) {
            const all = args.includes('-a');

            if (all || args.length === 0) {
                this.printLine('Linux linux-vm 5.15.0-generic #1 SMP x86_64 GNU/Linux');
            } else {
                let output = '';
                if (args.includes('-s')) output += 'Linux ';
                if (args.includes('-n')) output += 'linux-vm ';
                if (args.includes('-r')) output += '5.15.0-generic ';
                if (args.includes('-m')) output += 'x86_64 ';
                this.printLine(output.trim());
            }
        },

        uptime: function() {
            const up = fs.getUptime();
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            const uptimeStr = up.hours > 0 ? `${up.hours}:${up.minutes.toString().padStart(2, '0')}` : `${up.minutes} min`;

            this.printLine(` ${timeStr} up ${uptimeStr},  ${up.users} user,  load average: ${up.loadAvg.join(', ')}`);
        },

        date: function() {
            this.printLine(new Date().toLocaleString('cs-CZ'));
        },

        history: function() {
            this.commandHistory.forEach((cmd, i) => {
                this.printLine(`  ${(i + 1).toString().padStart(4)}  ${cmd}`);
            });
        },

        exit: function() {
            if (fs.isRoot) {
                fs.exitSudo();
                this.printLine('Opouštím režim superuživatele.');
                this.updatePrompt();
            } else {
                this.printLine('Nelze ukončit - toto je webový emulátor :)');
            }
        },

        sudo: function(args) {
            if (args.length === 0) {
                this.printError('sudo: chybí příkaz');
                this.printLine('Použití: sudo [příkaz] nebo sudo su');
                return;
            }

            // If already root, just run the command
            if (fs.isRoot) {
                const command = args[0].toLowerCase();
                const cmdArgs = args.slice(1);
                if (this.commands[command]) {
                    this.commands[command].call(this, cmdArgs);
                } else {
                    this.printError(`${command}: příkaz nenalezen`);
                }
                return;
            }

            // Ask for password
            this.printLine('[sudo] heslo pro ' + fs.user + ': ');
            this.awaitingSudoPassword = true;
            this.sudoCommand = args;
            this.inputEl.type = 'password';
        },

        id: function() {
            if (fs.isRoot) {
                this.printLine('uid=0(root) gid=0(root) groups=0(root)');
            } else {
                this.printLine('uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)');
            }
        },

        // Aliases
        ll: function(args) {
            this.commands.ls.call(this, ['-la', ...args]);
        },

        la: function(args) {
            this.commands.ls.call(this, ['-a', ...args]);
        },

        '.': function(args) {
            this.printError('.: chybí argument (název souboru)');
        }
    };

    // Wildcard matching helper
    matchWildcard(str, pattern) {
        const regexPattern = pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexPattern}$`).test(str);
    }
}

// Initialize terminal
const terminal = new Terminal();
