// Virtual Filesystem for Linux Emulator

class FileSystem {
    constructor() {
        this.root = this.createDefaultFS();
        this.currentPath = '/home/student';
        this.user = 'student';
        this.hostname = 'linux-vm';
    }

    createDefaultFS() {
        return {
            type: 'dir',
            name: '/',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            group: 'root',
            children: {
                'home': {
                    type: 'dir',
                    name: 'home',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    children: {
                        'student': {
                            type: 'dir',
                            name: 'student',
                            permissions: 'drwxr-xr-x',
                            owner: 'student',
                            group: 'student',
                            children: {
                                'Documents': {
                                    type: 'dir',
                                    name: 'Documents',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'student',
                                    group: 'student',
                                    children: {
                                        'notes.txt': {
                                            type: 'file',
                                            name: 'notes.txt',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            size: 156,
                                            content: `Poznámky k síťové bezpečnosti
==============================

1. HTTP přenáší data jako plain text
2. HTTPS šifruje veškerou komunikaci
3. Útočník na síti může zachytit HTTP provoz
4. Vždy kontrolujte zámek v prohlížeči!`
                                        },
                                        'passwords.txt': {
                                            type: 'file',
                                            name: 'passwords.txt',
                                            permissions: '-rw-------',
                                            owner: 'student',
                                            group: 'student',
                                            size: 89,
                                            content: `VAROVÁNÍ: Nikdy neukládejte hesla v plain textu!

Toto je pouze demonstrace špatné praxe.
admin: password123
user: qwerty`
                                        }
                                    }
                                },
                                'Downloads': {
                                    type: 'dir',
                                    name: 'Downloads',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'student',
                                    group: 'student',
                                    children: {}
                                },
                                'scripts': {
                                    type: 'dir',
                                    name: 'scripts',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'student',
                                    group: 'student',
                                    children: {
                                        'hello.sh': {
                                            type: 'file',
                                            name: 'hello.sh',
                                            permissions: '-rwxr-xr-x',
                                            owner: 'student',
                                            group: 'student',
                                            size: 45,
                                            content: `#!/bin/bash
echo "Ahoj, světe!"
echo "Datum: $(date)"`
                                        },
                                        'network_info.sh': {
                                            type: 'file',
                                            name: 'network_info.sh',
                                            permissions: '-rwxr-xr-x',
                                            owner: 'student',
                                            group: 'student',
                                            size: 123,
                                            content: `#!/bin/bash
echo "=== Síťové informace ==="
ifconfig
echo ""
echo "=== DNS servery ==="
cat /etc/resolv.conf`
                                        }
                                    }
                                },
                                '.bashrc': {
                                    type: 'file',
                                    name: '.bashrc',
                                    permissions: '-rw-r--r--',
                                    owner: 'student',
                                    group: 'student',
                                    size: 234,
                                    content: `# .bashrc

# Aliasy
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'

# Prompt
PS1='\\u@\\h:\\w\\$ '

# Exporty
export PATH=$PATH:/home/student/scripts`
                                },
                                '.ssh': {
                                    type: 'dir',
                                    name: '.ssh',
                                    permissions: 'drwx------',
                                    owner: 'student',
                                    group: 'student',
                                    children: {
                                        'known_hosts': {
                                            type: 'file',
                                            name: 'known_hosts',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            size: 0,
                                            content: ''
                                        }
                                    }
                                },
                                'readme.txt': {
                                    type: 'file',
                                    name: 'readme.txt',
                                    permissions: '-rw-r--r--',
                                    owner: 'student',
                                    group: 'student',
                                    size: 412,
                                    content: `Vítejte v Linux Emulátoru!
==========================

Tento emulátor vám pomůže pochopit:
- Základy práce s příkazovou řádkou
- Síťové příkazy a diagnostiku
- Rozdíl mezi HTTP a HTTPS
- Jak útočníci mohou zachytit nešifrovaný provoz

Začněte příkazem 'help' pro seznam dostupných příkazů.

Vyzkoušejte scénáře v pravém panelu pro interaktivní demonstrace!`
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    name: 'etc',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    children: {
                        'hosts': {
                            type: 'file',
                            name: 'hosts',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            size: 221,
                            content: `127.0.0.1       localhost
127.0.1.1       linux-vm
192.168.1.1     router.local
192.168.1.100   webserver.local
192.168.1.101   database.local

# Simulované servery pro výuku
93.184.216.34   example.com
142.250.74.78   google.com`
                        },
                        'resolv.conf': {
                            type: 'file',
                            name: 'resolv.conf',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            size: 67,
                            content: `# DNS konfigurace
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 1.1.1.1`
                        },
                        'passwd': {
                            type: 'file',
                            name: 'passwd',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            size: 156,
                            content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
student:x:1000:1000:Student:/home/student:/bin/bash`
                        },
                        'hostname': {
                            type: 'file',
                            name: 'hostname',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            size: 9,
                            content: 'linux-vm'
                        },
                        'network': {
                            type: 'dir',
                            name: 'network',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            group: 'root',
                            children: {
                                'interfaces': {
                                    type: 'file',
                                    name: 'interfaces',
                                    permissions: '-rw-r--r--',
                                    owner: 'root',
                                    group: 'root',
                                    size: 198,
                                    content: `# Network interfaces
auto lo
iface lo inet loopback

auto eth0
iface eth0 inet dhcp

auto wlan0
iface wlan0 inet dhcp
    wpa-ssid "SchoolNetwork"
    wpa-psk "********"`
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    name: 'var',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    children: {
                        'log': {
                            type: 'dir',
                            name: 'log',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            group: 'root',
                            children: {
                                'syslog': {
                                    type: 'file',
                                    name: 'syslog',
                                    permissions: '-rw-r-----',
                                    owner: 'root',
                                    group: 'adm',
                                    size: 4521,
                                    content: `Jan 15 10:23:45 linux-vm systemd[1]: Started Network Manager.
Jan 15 10:23:46 linux-vm NetworkManager[892]: <info> eth0: link connected
Jan 15 10:23:47 linux-vm dhclient[923]: DHCPREQUEST for 192.168.1.50
Jan 15 10:23:47 linux-vm dhclient[923]: DHCPACK from 192.168.1.1
Jan 15 10:23:48 linux-vm NetworkManager[892]: <info> eth0: IP configuration successful
Jan 15 10:24:01 linux-vm CRON[1045]: (root) CMD (test -x /usr/sbin/anacron)
Jan 15 10:25:00 linux-vm kernel: [UFW BLOCK] IN=eth0 OUT= SRC=192.168.1.200 DST=192.168.1.50`
                                },
                                'auth.log': {
                                    type: 'file',
                                    name: 'auth.log',
                                    permissions: '-rw-r-----',
                                    owner: 'root',
                                    group: 'adm',
                                    size: 892,
                                    content: `Jan 15 10:23:50 linux-vm sshd[1001]: Server listening on 0.0.0.0 port 22.
Jan 15 10:24:15 linux-vm sudo: student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/bin/ls
Jan 15 10:24:30 linux-vm sshd[1123]: Failed password for invalid user admin from 192.168.1.200
Jan 15 10:24:31 linux-vm sshd[1123]: Failed password for invalid user admin from 192.168.1.200
Jan 15 10:24:32 linux-vm sshd[1123]: Connection closed by 192.168.1.200`
                                }
                            }
                        },
                        'www': {
                            type: 'dir',
                            name: 'www',
                            permissions: 'drwxr-xr-x',
                            owner: 'www-data',
                            group: 'www-data',
                            children: {
                                'html': {
                                    type: 'dir',
                                    name: 'html',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'www-data',
                                    group: 'www-data',
                                    children: {
                                        'index.html': {
                                            type: 'file',
                                            name: 'index.html',
                                            permissions: '-rw-r--r--',
                                            owner: 'www-data',
                                            group: 'www-data',
                                            size: 234,
                                            content: `<!DOCTYPE html>
<html>
<head>
    <title>Webový server</title>
</head>
<body>
    <h1>Vítejte na lokálním serveru</h1>
    <p>Toto je testovací stránka.</p>
</body>
</html>`
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    name: 'usr',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    children: {
                        'bin': {
                            type: 'dir',
                            name: 'bin',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            group: 'root',
                            children: {}
                        },
                        'share': {
                            type: 'dir',
                            name: 'share',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            group: 'root',
                            children: {
                                'doc': {
                                    type: 'dir',
                                    name: 'doc',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'root',
                                    group: 'root',
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    name: 'tmp',
                    permissions: 'drwxrwxrwt',
                    owner: 'root',
                    group: 'root',
                    children: {}
                }
            }
        };
    }

    // Resolve path to absolute path
    resolvePath(path) {
        if (!path || path === '') {
            return this.currentPath;
        }

        let resolvedPath;

        if (path === '~') {
            resolvedPath = `/home/${this.user}`;
        } else if (path.startsWith('~/')) {
            resolvedPath = `/home/${this.user}/${path.slice(2)}`;
        } else if (path.startsWith('/')) {
            resolvedPath = path;
        } else {
            resolvedPath = this.currentPath === '/'
                ? `/${path}`
                : `${this.currentPath}/${path}`;
        }

        // Normalize path (handle . and ..)
        const parts = resolvedPath.split('/').filter(p => p !== '' && p !== '.');
        const normalized = [];

        for (const part of parts) {
            if (part === '..') {
                normalized.pop();
            } else {
                normalized.push(part);
            }
        }

        return '/' + normalized.join('/');
    }

    // Get node at path
    getNode(path) {
        const resolvedPath = this.resolvePath(path);

        if (resolvedPath === '/') {
            return this.root;
        }

        const parts = resolvedPath.split('/').filter(p => p !== '');
        let current = this.root;

        for (const part of parts) {
            if (!current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }

        return current;
    }

    // List directory contents
    listDir(path = '', options = {}) {
        const node = this.getNode(path);

        if (!node) {
            return { error: `ls: nelze přistoupit k '${path}': Adresář nebo soubor neexistuje` };
        }

        if (node.type !== 'dir') {
            return {
                files: [{
                    name: node.name,
                    type: 'file',
                    permissions: node.permissions,
                    owner: node.owner,
                    group: node.group,
                    size: node.size || 0
                }]
            };
        }

        let files = Object.values(node.children);

        // Filter hidden files unless -a flag
        if (!options.all) {
            files = files.filter(f => !f.name.startsWith('.'));
        }

        // Sort files
        files.sort((a, b) => {
            // Directories first
            if (a.type === 'dir' && b.type !== 'dir') return -1;
            if (a.type !== 'dir' && b.type === 'dir') return 1;
            return a.name.localeCompare(b.name);
        });

        return {
            files: files.map(f => ({
                name: f.name,
                type: f.type,
                permissions: f.permissions,
                owner: f.owner,
                group: f.group,
                size: f.size || 0
            }))
        };
    }

    // Change directory
    changeDir(path) {
        if (!path || path === '') {
            this.currentPath = `/home/${this.user}`;
            return { success: true };
        }

        const resolvedPath = this.resolvePath(path);
        const node = this.getNode(path);

        if (!node) {
            return { error: `cd: ${path}: Adresář nebo soubor neexistuje` };
        }

        if (node.type !== 'dir') {
            return { error: `cd: ${path}: Není adresář` };
        }

        this.currentPath = resolvedPath;
        return { success: true };
    }

    // Read file content
    readFile(path) {
        const node = this.getNode(path);

        if (!node) {
            return { error: `cat: ${path}: Soubor nebo adresář neexistuje` };
        }

        if (node.type === 'dir') {
            return { error: `cat: ${path}: Je adresář` };
        }

        return { content: node.content };
    }

    // Create directory
    makeDir(path) {
        const resolvedPath = this.resolvePath(path);
        const parts = resolvedPath.split('/').filter(p => p !== '');
        const dirName = parts.pop();
        const parentPath = '/' + parts.join('/');

        const parent = this.getNode(parentPath || '/');

        if (!parent) {
            return { error: `mkdir: nelze vytvořit adresář '${path}': Adresář neexistuje` };
        }

        if (parent.type !== 'dir') {
            return { error: `mkdir: nelze vytvořit adresář '${path}': Není adresář` };
        }

        if (parent.children[dirName]) {
            return { error: `mkdir: nelze vytvořit adresář '${path}': Soubor existuje` };
        }

        parent.children[dirName] = {
            type: 'dir',
            name: dirName,
            permissions: 'drwxr-xr-x',
            owner: this.user,
            group: this.user,
            children: {}
        };

        return { success: true };
    }

    // Create file
    touchFile(path) {
        const resolvedPath = this.resolvePath(path);
        const parts = resolvedPath.split('/').filter(p => p !== '');
        const fileName = parts.pop();
        const parentPath = '/' + parts.join('/');

        const parent = this.getNode(parentPath || '/');

        if (!parent) {
            return { error: `touch: nelze vytvořit '${path}': Adresář neexistuje` };
        }

        if (parent.type !== 'dir') {
            return { error: `touch: nelze vytvořit '${path}': Není adresář` };
        }

        if (!parent.children[fileName]) {
            parent.children[fileName] = {
                type: 'file',
                name: fileName,
                permissions: '-rw-r--r--',
                owner: this.user,
                group: this.user,
                size: 0,
                content: ''
            };
        }

        return { success: true };
    }

    // Remove file or directory
    remove(path, options = {}) {
        const resolvedPath = this.resolvePath(path);
        const parts = resolvedPath.split('/').filter(p => p !== '');
        const name = parts.pop();
        const parentPath = '/' + parts.join('/');

        const parent = this.getNode(parentPath || '/');
        const node = this.getNode(path);

        if (!node) {
            return { error: `rm: nelze odstranit '${path}': Soubor nebo adresář neexistuje` };
        }

        if (node.type === 'dir' && !options.recursive) {
            return { error: `rm: nelze odstranit '${path}': Je adresář` };
        }

        if (node.type === 'dir' && Object.keys(node.children).length > 0 && !options.recursive) {
            return { error: `rm: nelze odstranit '${path}': Adresář není prázdný` };
        }

        delete parent.children[name];
        return { success: true };
    }

    // Get current working directory
    pwd() {
        return this.currentPath;
    }

    // Get prompt string
    getPrompt() {
        let displayPath = this.currentPath;
        const homePath = `/home/${this.user}`;

        if (displayPath === homePath) {
            displayPath = '~';
        } else if (displayPath.startsWith(homePath + '/')) {
            displayPath = '~' + displayPath.slice(homePath.length);
        }

        return `${this.user}@${this.hostname}:${displayPath}$`;
    }
}

// Export for use in other files
const fs = new FileSystem();
