// Virtual Filesystem for Linux Emulator

class FileSystem {
    constructor() {
        this.root = this.createDefaultFS();
        this.currentPath = '/home/student';
        this.user = 'student';
        this.hostname = 'linux-vm';
        this.startTime = Date.now();
        this.isRoot = false;
        this.sudoPassword = 'penguin123';  // The password students need to find
    }

    createDefaultFS() {
        return {
            type: 'dir',
            name: '/',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            group: 'root',
            modified: '2024-01-15 10:00:00',
            children: {
                'home': {
                    type: 'dir',
                    name: 'home',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    modified: '2024-01-15 10:00:00',
                    children: {
                        'student': {
                            type: 'dir',
                            name: 'student',
                            permissions: 'drwxr-xr-x',
                            owner: 'student',
                            group: 'student',
                            modified: '2024-01-20 14:30:00',
                            children: {
                                'Documents': {
                                    type: 'dir',
                                    name: 'Documents',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'student',
                                    group: 'student',
                                    modified: '2024-01-20 14:30:00',
                                    children: {
                                        'notes.txt': {
                                            type: 'file',
                                            name: 'notes.txt',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-18 09:15:00',
                                            size: 247,
                                            content: `Poznámky z přednášky
====================

Linux je open-source operační systém.
Příkazová řádka je mocný nástroj.

Důležité příkazy:
- ls    = výpis souborů
- cd    = změna adresáře
- cat   = zobrazení obsahu
- grep  = hledání v textu

Heslo do systému: ********
(jen si dělám srandu, hesla se takto neukládají!)`
                                        },
                                        'report.txt': {
                                            type: 'file',
                                            name: 'report.txt',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-19 16:45:00',
                                            size: 523,
                                            content: `TAJNÁ ZPRÁVA
============
Kód: ALPHA-7
Status: AKTIVNÍ

Agent byl úspěšně nasazen.
Lokace: Praha, sektor 4
Mise: Získat přístup do systému

Kontaktní body:
- Primární: Karlův most, 14:00
- Záložní: Staroměstské náměstí, 18:00

Heslo pro další instrukce: "modrý_slon_42"

POZOR: Tuto zprávu po přečtení zničte!
(Stačí příkaz: rm report.txt)

--- KONEC PŘENOSU ---`
                                        },
                                        'todo.txt': {
                                            type: 'file',
                                            name: 'todo.txt',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-20 08:00:00',
                                            size: 156,
                                            content: `Úkoly na dnes:
[x] Naučit se příkaz ls
[x] Prozkoumat adresáře
[ ] Najít skrytý soubor
[ ] Přečíst tajnou zprávu
[ ] Rozluštit záhadu v /var/log`
                                        }
                                    }
                                },
                                'Downloads': {
                                    type: 'dir',
                                    name: 'Downloads',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'student',
                                    group: 'student',
                                    modified: '2024-01-19 20:00:00',
                                    children: {
                                        'image.png': {
                                            type: 'file',
                                            name: 'image.png',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-19 20:00:00',
                                            size: 2048,
                                            binary: true,
                                            content: '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\x08\x02SECRET_DATA_HIDDEN_HERE\x00\x00'
                                        },
                                        'mystery.dat': {
                                            type: 'file',
                                            name: 'mystery.dat',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-17 12:00:00',
                                            size: 64,
                                            binary: true,
                                            content: 'FLAG{hexdump_master}\x00\x00\x00\x00Binary files can hide secrets!'
                                        }
                                    }
                                },
                                'scripts': {
                                    type: 'dir',
                                    name: 'scripts',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'student',
                                    group: 'student',
                                    modified: '2024-01-15 11:00:00',
                                    children: {
                                        'hello.sh': {
                                            type: 'file',
                                            name: 'hello.sh',
                                            permissions: '-rwxr-xr-x',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-15 11:00:00',
                                            size: 45,
                                            content: `#!/bin/bash
echo "Ahoj, světe!"
echo "Dnes je $(date)"`
                                        },
                                        'count.sh': {
                                            type: 'file',
                                            name: 'count.sh',
                                            permissions: '-rwxr-xr-x',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-15 11:30:00',
                                            size: 89,
                                            content: `#!/bin/bash
for i in 1 2 3 4 5
do
    echo "Počítám: $i"
done
echo "Hotovo!"`
                                        }
                                    }
                                },
                                'projects': {
                                    type: 'dir',
                                    name: 'projects',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'student',
                                    group: 'student',
                                    modified: '2024-01-20 10:00:00',
                                    children: {
                                        'web': {
                                            type: 'dir',
                                            name: 'web',
                                            permissions: 'drwxr-xr-x',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-20 10:00:00',
                                            children: {
                                                'index.html': {
                                                    type: 'file',
                                                    name: 'index.html',
                                                    permissions: '-rw-r--r--',
                                                    owner: 'student',
                                                    group: 'student',
                                                    modified: '2024-01-20 10:00:00',
                                                    size: 312,
                                                    content: `<!DOCTYPE html>
<html>
<head>
    <title>Můj web</title>
</head>
<body>
    <h1>Vítejte!</h1>
    <p>Toto je můj první web.</p>
    <!-- TODO: přidat více obsahu -->
    <!-- SECRET: flag_html_explorer -->
</body>
</html>`
                                                },
                                                'style.css': {
                                                    type: 'file',
                                                    name: 'style.css',
                                                    permissions: '-rw-r--r--',
                                                    owner: 'student',
                                                    group: 'student',
                                                    modified: '2024-01-20 10:00:00',
                                                    size: 156,
                                                    content: `body {
    font-family: Arial, sans-serif;
    background: #1a1a2e;
    color: #eee;
}

h1 {
    color: #4ade80;
}

/* Theme: hacker_mode */`
                                                }
                                            }
                                        }
                                    }
                                },
                                '.bashrc': {
                                    type: 'file',
                                    name: '.bashrc',
                                    permissions: '-rw-r--r--',
                                    owner: 'student',
                                    group: 'student',
                                    modified: '2024-01-15 10:00:00',
                                    size: 234,
                                    content: `# .bashrc - Konfigurace shellu

# Aliasy
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'

# Prompt
PS1='\\u@\\h:\\w\\$ '

# Historie
HISTSIZE=1000

# Tajný alias (pssst!)
alias matrix='echo "Wake up, Neo..."'`
                                },
                                '.secret': {
                                    type: 'file',
                                    name: '.secret',
                                    permissions: '-rw-------',
                                    owner: 'student',
                                    group: 'student',
                                    modified: '2024-01-10 03:00:00',
                                    size: 178,
                                    content: `GRATULACE!

Našel jsi skrytý soubor!
Skryté soubory začínají tečkou (.)
a normálně je příkaz 'ls' nezobrazí.

Pro zobrazení skrytých souborů použij:
ls -a

Tvůj kód: HIDDEN_MASTER_2024

Pokračuj v průzkumu!`
                                },
                                '.config': {
                                    type: 'dir',
                                    name: '.config',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'student',
                                    group: 'student',
                                    modified: '2024-01-15 10:00:00',
                                    children: {
                                        'settings.json': {
                                            type: 'file',
                                            name: 'settings.json',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-15 10:00:00',
                                            size: 89,
                                            content: `{
    "theme": "dark",
    "language": "cs",
    "secret_level": 42,
    "flag": "config_explorer"
}`
                                        }
                                    }
                                },
                                'readme.txt': {
                                    type: 'file',
                                    name: 'readme.txt',
                                    permissions: '-rw-r--r--',
                                    owner: 'student',
                                    group: 'student',
                                    modified: '2024-01-20 14:00:00',
                                    size: 456,
                                    content: `Vítej v Linux terminálu!
========================

Toto je tvůj domovský adresář.
Můžeš zde prozkoumávat soubory a složky.

Základní příkazy:
- ls        Zobraz obsah složky
- ls -la    Zobraz VŠE včetně skrytých souborů
- cd X      Přejdi do složky X
- cd ..     Vrať se o úroveň výš
- cat X     Zobraz obsah souboru X
- pwd       Kde právě jsem?

Pro nápovědu k příkazu napiš:
man PŘÍKAZ

Hodně štěstí při průzkumu!

PS: Některé věci jsou skryté... ;-)`
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
                    modified: '2024-01-15 10:00:00',
                    children: {
                        'hosts': {
                            type: 'file',
                            name: 'hosts',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-15 10:00:00',
                            size: 156,
                            content: `127.0.0.1       localhost
127.0.1.1       linux-vm
192.168.1.1     router
192.168.1.100   server

# Tajný server (nikdo neví, že existuje)
10.13.37.1      secret.hq`
                        },
                        'passwd': {
                            type: 'file',
                            name: 'passwd',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-15 10:00:00',
                            size: 245,
                            content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
student:x:1000:1000:Student User:/home/student:/bin/bash
guest:x:1001:1001:Guest:/home/guest:/bin/bash
admin:x:1002:1002:Administrator:/home/admin:/bin/bash`
                        },
                        'hostname': {
                            type: 'file',
                            name: 'hostname',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-15 10:00:00',
                            size: 9,
                            content: 'linux-vm'
                        },
                        'os-release': {
                            type: 'file',
                            name: 'os-release',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-15 10:00:00',
                            size: 198,
                            content: `NAME="Linux Emulator"
VERSION="1.0"
ID=linuxemu
PRETTY_NAME="Linux Emulator 1.0 (Educational)"
VERSION_ID="1.0"
HOME_URL="https://example.com"
BUG_REPORT_URL="https://example.com/bugs"`
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    name: 'var',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    modified: '2024-01-15 10:00:00',
                    children: {
                        'log': {
                            type: 'dir',
                            name: 'log',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-20 15:00:00',
                            children: {
                                'syslog': {
                                    type: 'file',
                                    name: 'syslog',
                                    permissions: '-rw-r-----',
                                    owner: 'root',
                                    group: 'adm',
                                    modified: '2024-01-20 15:00:00',
                                    size: 2341,
                                    content: `Jan 20 10:00:01 linux-vm systemd[1]: Started System Logging Service.
Jan 20 10:00:02 linux-vm kernel: Linux version 5.15.0-generic
Jan 20 10:00:03 linux-vm NetworkManager[892]: <info> Starting...
Jan 20 10:00:05 linux-vm systemd[1]: Started Login Service.
Jan 20 10:15:00 linux-vm CRON[1234]: (root) CMD (test -x /usr/sbin/anacron)
Jan 20 10:30:00 linux-vm sudo: student : TTY=pts/0 ; PWD=/home/student ; COMMAND=/bin/ls
Jan 20 11:00:00 linux-vm sshd[2001]: Failed password for admin from 192.168.1.200
Jan 20 11:00:01 linux-vm sshd[2001]: Failed password for admin from 192.168.1.200
Jan 20 11:00:02 linux-vm sshd[2001]: Failed password for admin from 192.168.1.200
Jan 20 11:00:03 linux-vm sshd[2001]: Connection closed by 192.168.1.200 [preauth]
Jan 20 12:00:00 linux-vm kernel: [UFW BLOCK] IN=eth0 SRC=192.168.1.200 DST=192.168.1.50
Jan 20 13:37:00 linux-vm secret-agent[9999]: FLAG{log_detective} - Mission accomplished
Jan 20 14:00:00 linux-vm systemd[1]: Started Daily Cleanup.`
                                },
                                'auth.log': {
                                    type: 'file',
                                    name: 'auth.log',
                                    permissions: '-rw-r-----',
                                    owner: 'root',
                                    group: 'adm',
                                    modified: '2024-01-20 14:00:00',
                                    size: 567,
                                    content: `Jan 20 09:00:00 linux-vm sshd[1001]: Server listening on 0.0.0.0 port 22.
Jan 20 09:30:15 linux-vm login[1123]: pam_unix(login:session): session opened for user student
Jan 20 10:00:00 linux-vm sudo: student : TTY=pts/0 ; COMMAND=/bin/cat /etc/passwd
Jan 20 11:00:00 linux-vm sshd[2001]: Invalid user hacker from 192.168.1.200
Jan 20 11:00:01 linux-vm sshd[2001]: Failed password for invalid user hacker
Jan 20 11:00:02 linux-vm sshd[2001]: Disconnecting: Too many authentication failures
Jan 20 14:30:00 linux-vm sudo: admin left a backup file somewhere in /tmp... that's not secure!`
                                },
                                'access.log': {
                                    type: 'file',
                                    name: 'access.log',
                                    permissions: '-rw-r--r--',
                                    owner: 'root',
                                    group: 'root',
                                    modified: '2024-01-20 15:00:00',
                                    size: 890,
                                    content: `192.168.1.10 - - [20/Jan/2024:10:00:00] "GET / HTTP/1.1" 200 1234
192.168.1.10 - - [20/Jan/2024:10:00:01] "GET /style.css HTTP/1.1" 200 567
192.168.1.15 - - [20/Jan/2024:10:30:00] "GET /admin HTTP/1.1" 403 128
192.168.1.200 - - [20/Jan/2024:11:00:00] "GET /../../etc/passwd HTTP/1.1" 400 0
192.168.1.200 - - [20/Jan/2024:11:00:01] "POST /login HTTP/1.1" 401 64
192.168.1.200 - - [20/Jan/2024:11:00:02] "GET /secret HTTP/1.1" 404 32
192.168.1.20 - - [20/Jan/2024:12:00:00] "GET /api/data HTTP/1.1" 200 2048
192.168.1.20 - - [20/Jan/2024:12:00:01] "GET /flag.txt HTTP/1.1" 200 32`
                                }
                            }
                        },
                        'www': {
                            type: 'dir',
                            name: 'www',
                            permissions: 'drwxr-xr-x',
                            owner: 'www-data',
                            group: 'www-data',
                            modified: '2024-01-15 10:00:00',
                            children: {
                                'html': {
                                    type: 'dir',
                                    name: 'html',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'www-data',
                                    group: 'www-data',
                                    modified: '2024-01-15 10:00:00',
                                    children: {
                                        'index.html': {
                                            type: 'file',
                                            name: 'index.html',
                                            permissions: '-rw-r--r--',
                                            owner: 'www-data',
                                            group: 'www-data',
                                            modified: '2024-01-15 10:00:00',
                                            size: 234,
                                            content: `<!DOCTYPE html>
<html>
<head>
    <title>Web Server</title>
</head>
<body>
    <h1>Welcome to the Web Server</h1>
    <p>This server is running on linux-vm.</p>
</body>
</html>`
                                        }
                                    }
                                }
                            }
                        },
                        'mail': {
                            type: 'dir',
                            name: 'mail',
                            permissions: 'drwxrwxr-x',
                            owner: 'root',
                            group: 'mail',
                            modified: '2024-01-20 08:00:00',
                            children: {
                                'student': {
                                    type: 'file',
                                    name: 'student',
                                    permissions: '-rw-rw----',
                                    owner: 'student',
                                    group: 'mail',
                                    modified: '2024-01-20 08:00:00',
                                    size: 456,
                                    content: `From: admin@linux-vm
To: student@linux-vm
Subject: Vítej v systému!
Date: Mon, 20 Jan 2024 08:00:00 +0100

Ahoj studente,

Vítej v našem Linux systému!

Tvým úkolem je prozkoumat systém a najít všechny
ukryté vlajky (FLAG{...}).

Tip: Podívej se do logů v /var/log

Hodně štěstí!
Admin

---
From: system@linux-vm
To: student@linux-vm
Subject: Bezpečnostní upozornění
Date: Mon, 20 Jan 2024 11:30:00 +0100

VAROVÁNÍ: Zaznamenali jsme podezřelou aktivitu
z IP adresy 192.168.1.200

Zkontroluj prosím logy.`
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
                    modified: '2024-01-15 10:00:00',
                    children: {
                        'bin': {
                            type: 'dir',
                            name: 'bin',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-15 10:00:00',
                            children: {}
                        },
                        'share': {
                            type: 'dir',
                            name: 'share',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-15 10:00:00',
                            children: {
                                'games': {
                                    type: 'dir',
                                    name: 'games',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'root',
                                    group: 'root',
                                    modified: '2024-01-15 10:00:00',
                                    children: {
                                        'fortune.txt': {
                                            type: 'file',
                                            name: 'fortune.txt',
                                            permissions: '-rw-r--r--',
                                            owner: 'root',
                                            group: 'root',
                                            modified: '2024-01-15 10:00:00',
                                            size: 312,
                                            content: `Moudrost dne:
=============

"V Linuxu je vše soubor."

"Kdo ovládá terminál, ovládá systém."

"Grep je tvůj přítel."

"Skryté soubory začínají tečkou."

"Když nevíš, použij man."

"Root má vždy pravdu (a plná práva)."`
                                        }
                                    }
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
                    modified: '2024-01-20 15:00:00',
                    children: {
                        'note.txt': {
                            type: 'file',
                            name: 'note.txt',
                            permissions: '-rw-r--r--',
                            owner: 'nobody',
                            group: 'nogroup',
                            modified: '2024-01-20 14:00:00',
                            size: 67,
                            content: `Někdo tu zanechal vzkaz...

Heslo je: tmp_explorer_2024

Kdo to asi byl?`
                        },
                        '.admin_backup': {
                            type: 'file',
                            name: '.admin_backup',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-19 23:45:00',
                            size: 156,
                            content: `POZNÁMKA PRO ADMINA
===================
(tohle jsem sem neměl dávat, ale pořád zapomínám heslo)

sudo heslo: penguin123

SMAŽ TOHLE JAKMILE SI TO ZAPAMATUJEŠ!`
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    name: 'root',
                    permissions: 'drwx------',
                    owner: 'root',
                    group: 'root',
                    modified: '2024-01-15 10:00:00',
                    children: {
                        '.bash_history': {
                            type: 'file',
                            name: '.bash_history',
                            permissions: '-rw-------',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-20 12:00:00',
                            size: 234,
                            content: `ls -la
cd /home/student
cat .secret
grep FLAG /var/log/*
chmod 700 /root
echo "Super tajné heslo: admin123" > /root/.password
rm /root/.password
history -c`
                        },
                        'classified.txt': {
                            type: 'file',
                            name: 'classified.txt',
                            permissions: '-rw-------',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-20 02:00:00',
                            size: 456,
                            content: `╔══════════════════════════════════════════════════════╗
║          PŘÍSNĚ TAJNÉ - POUZE PRO ROOT               ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  GRATULACE, AGENTE!                                  ║
║                                                      ║
║  Úspěšně jsi získal root přístup k systému.          ║
║  Tvoje mise je splněna.                              ║
║                                                      ║
║  FLAG{sudo_master_2024}                              ║
║                                                      ║
║  "S velkou mocí přichází velká zodpovědnost."        ║
║                       - Uncle Ben (a každý sysadmin) ║
║                                                      ║
╚══════════════════════════════════════════════════════╝`
                        },
                        'nuclear_codes.txt': {
                            type: 'file',
                            name: 'nuclear_codes.txt',
                            permissions: '-rw-------',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-01 00:00:00',
                            size: 89,
                            content: `JADERNÉ KÓDY
============
Jen si dělám srandu :D

Ale vážně, tohle je root-only soubor.
Dobrá práce, že ses sem dostal!`
                        }
                    }
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
                    size: node.size || 0,
                    modified: node.modified
                }]
            };
        }

        // Check directory access permissions
        if (!this.canAccessDir(node)) {
            return { error: `ls: nelze otevřít adresář '${path}': Přístup odepřen` };
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
                size: f.size || 4096,
                modified: f.modified
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

        // Check directory access permissions
        if (!this.canAccessDir(node)) {
            return { error: `cd: ${path}: Přístup odepřen` };
        }

        this.currentPath = resolvedPath;
        return { success: true };
    }

    // Check if current user can read file
    canRead(node) {
        if (this.isRoot) return true;

        // Check owner permissions
        if (node.owner === this.user) {
            return node.permissions[1] === 'r';
        }
        // Check group permissions (simplified - just check "others")
        return node.permissions[7] === 'r';
    }

    // Check if current user can access directory
    canAccessDir(node) {
        if (this.isRoot) return true;

        if (node.owner === this.user) {
            return node.permissions[3] === 'x';
        }
        return node.permissions[9] === 'x';
    }

    // Try sudo authentication
    trySudo(password) {
        if (password === this.sudoPassword) {
            this.isRoot = true;
            return { success: true };
        }
        return { error: 'Chybné heslo. Tento incident bude nahlášen.' };
    }

    // Exit sudo mode
    exitSudo() {
        this.isRoot = false;
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

        // Check read permissions
        if (!this.canRead(node)) {
            return { error: `cat: ${path}: Přístup odepřen` };
        }

        return { content: node.content, binary: node.binary };
    }

    // Get file info (for stat command)
    getFileInfo(path) {
        const node = this.getNode(path);
        const resolvedPath = this.resolvePath(path);

        if (!node) {
            return { error: `stat: nelze získat informace o '${path}': Soubor nebo adresář neexistuje` };
        }

        return {
            name: node.name,
            path: resolvedPath,
            type: node.type,
            permissions: node.permissions,
            owner: node.owner,
            group: node.group,
            size: node.size || 4096,
            modified: node.modified,
            inode: Math.floor(Math.random() * 900000) + 100000,
            links: node.type === 'dir' ? 2 : 1,
            blocks: Math.ceil((node.size || 4096) / 512)
        };
    }

    // Detect file type
    getFileType(path) {
        const node = this.getNode(path);

        if (!node) {
            return { error: `file: ${path}: Soubor nebo adresář neexistuje` };
        }

        if (node.type === 'dir') {
            return { type: 'directory' };
        }

        const name = node.name.toLowerCase();
        const content = node.content || '';

        if (name.endsWith('.txt')) {
            return { type: 'ASCII text' };
        } else if (name.endsWith('.html')) {
            return { type: 'HTML document, ASCII text' };
        } else if (name.endsWith('.css')) {
            return { type: 'CSS stylesheet, ASCII text' };
        } else if (name.endsWith('.js')) {
            return { type: 'JavaScript source, ASCII text' };
        } else if (name.endsWith('.json')) {
            return { type: 'JSON data' };
        } else if (name.endsWith('.sh')) {
            return { type: 'Bourne-Again shell script, ASCII text executable' };
        } else if (name.endsWith('.png')) {
            return { type: 'PNG image data' };
        } else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
            return { type: 'JPEG image data' };
        } else if (name.endsWith('.dat')) {
            return { type: 'data' };
        } else if (content.startsWith('#!/bin/bash') || content.startsWith('#!/bin/sh')) {
            return { type: 'Bourne-Again shell script, ASCII text executable' };
        } else if (content.startsWith('<!DOCTYPE') || content.startsWith('<html')) {
            return { type: 'HTML document, ASCII text' };
        } else if (node.binary) {
            return { type: 'data' };
        } else {
            return { type: 'ASCII text' };
        }
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
            modified: new Date().toISOString().replace('T', ' ').slice(0, 19),
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

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        if (!parent.children[fileName]) {
            parent.children[fileName] = {
                type: 'file',
                name: fileName,
                permissions: '-rw-r--r--',
                owner: this.user,
                group: this.user,
                modified: now,
                size: 0,
                content: ''
            };
        } else {
            parent.children[fileName].modified = now;
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
            return { error: `rm: nelze odstranit '${path}': Je adresář (použij -r)` };
        }

        if (node.type === 'dir' && Object.keys(node.children).length > 0 && !options.recursive) {
            return { error: `rm: nelze odstranit '${path}': Adresář není prázdný` };
        }

        delete parent.children[name];
        return { success: true };
    }

    // Search files with grep
    grep(pattern, path, options = {}) {
        const node = this.getNode(path);

        if (!node) {
            return { error: `grep: ${path}: Soubor nebo adresář neexistuje` };
        }

        const results = [];
        const regex = options.ignoreCase
            ? new RegExp(pattern, 'gi')
            : new RegExp(pattern, 'g');

        const searchFile = (filePath, fileNode) => {
            if (fileNode.type !== 'file' || fileNode.binary) return;

            const lines = (fileNode.content || '').split('\n');
            lines.forEach((line, idx) => {
                if (regex.test(line)) {
                    results.push({
                        file: filePath,
                        lineNum: idx + 1,
                        line: line
                    });
                }
                regex.lastIndex = 0; // Reset regex state
            });
        };

        const searchDir = (dirPath, dirNode) => {
            for (const [name, child] of Object.entries(dirNode.children || {})) {
                const childPath = dirPath === '/' ? `/${name}` : `${dirPath}/${name}`;
                if (child.type === 'file') {
                    searchFile(childPath, child);
                } else if (child.type === 'dir' && options.recursive) {
                    searchDir(childPath, child);
                }
            }
        };

        if (node.type === 'file') {
            searchFile(this.resolvePath(path), node);
        } else {
            if (options.recursive) {
                searchDir(this.resolvePath(path), node);
            } else {
                return { error: `grep: ${path}: Je adresář` };
            }
        }

        return { results };
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

        // Root uses # instead of $
        const promptChar = this.isRoot ? '#' : '$';
        const displayUser = this.isRoot ? 'root' : this.user;

        return `${displayUser}@${this.hostname}:${displayPath}${promptChar}`;
    }

    // Get system uptime
    getUptime() {
        const uptimeMs = Date.now() - this.startTime;
        const seconds = Math.floor(uptimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        return {
            hours: hours,
            minutes: minutes % 60,
            seconds: seconds % 60,
            users: 1,
            loadAvg: [0.15, 0.10, 0.05]
        };
    }
}

// Export for use in other files
const fs = new FileSystem();
