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
                                            content: `Lecture Notes
=============

Linux is an open-source operating system.
The command line is a powerful tool.

Important commands:
- ls    = list files
- cd    = change directory
- cat   = display file contents
- grep  = search in text

System password: ********
(just kidding, passwords aren't stored like this!)`
                                        },
                                        'report.txt': {
                                            type: 'file',
                                            name: 'report.txt',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-19 16:45:00',
                                            size: 523,
                                            content: `SECRET MESSAGE
==============
Code: ALPHA-7
Status: ACTIVE

Agent has been successfully deployed.
Location: London, sector 4
Mission: Gain access to the system

Contact points:
- Primary: Tower Bridge, 14:00
- Backup: Trafalgar Square, 18:00

Password for further instructions: "blue_elephant_42"

WARNING: Destroy this message after reading!
(Just use: rm report.txt)

--- END OF TRANSMISSION ---`
                                        },
                                        'todo.txt': {
                                            type: 'file',
                                            name: 'todo.txt',
                                            permissions: '-rw-r--r--',
                                            owner: 'student',
                                            group: 'student',
                                            modified: '2024-01-20 08:00:00',
                                            size: 156,
                                            content: `Today's tasks:
[x] Learn the ls command
[x] Explore directories
[ ] Find the hidden file
[ ] Read the secret message
[ ] Solve the mystery in /var/log`
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
echo "Hello, world!"
echo "Today is $(date)"`
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
    echo "Counting: $i"
done
echo "Done!"`
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
    <title>My Website</title>
</head>
<body>
    <h1>Welcome!</h1>
    <p>This is my first website.</p>
    <!-- TODO: add more content -->
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
                                    content: `# .bashrc - Shell configuration

# Aliases
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'

# Prompt
PS1='\\u@\\h:\\w\\$ '

# History
HISTSIZE=1000

# Secret alias (shhh!)
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
                                    content: `CONGRATULATIONS!

You found a hidden file!
Hidden files start with a dot (.)
and the 'ls' command doesn't show them by default.

To see hidden files, use:
ls -a

Your code: HIDDEN_MASTER_2024

Keep exploring!`
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
                                    content: `Welcome to the Linux terminal!
==============================

This is your home directory.
You can explore files and folders here.

Basic commands:
- ls        List folder contents
- ls -la    Show EVERYTHING including hidden files
- cd X      Go to folder X
- cd ..     Go back one level
- cat X     Display contents of file X
- pwd       Where am I?

For help with a command, type:
man COMMAND

Good luck exploring!

PS: Some things are hidden... ;-)`
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

# Secret server (nobody knows it exists)
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
Subject: Welcome to the system!
Date: Mon, 20 Jan 2024 08:00:00 +0100

Hello student,

Welcome to our Linux system!

Your task is to explore the system and find all
hidden flags (FLAG{...}).

Tip: Check out the logs in /var/log

Good luck!
Admin

---
From: system@linux-vm
To: student@linux-vm
Subject: Security Alert
Date: Mon, 20 Jan 2024 11:30:00 +0100

WARNING: We detected suspicious activity
from IP address 192.168.1.200

Please check the logs.`
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
                                            content: `Wisdom of the day:
==================

"In Linux, everything is a file."

"Who controls the terminal, controls the system."

"Grep is your friend."

"Hidden files start with a dot."

"When in doubt, use man."

"Root is always right (and has full permissions)."`
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
                            content: `Someone left a note here...

The password is: tmp_explorer_2024

Who could it have been?`
                        },
                        '.admin_backup': {
                            type: 'file',
                            name: '.admin_backup',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            group: 'root',
                            modified: '2024-01-19 23:45:00',
                            size: 156,
                            content: `NOTE FOR ADMIN
==============
(I shouldn't have put this here, but I keep forgetting the password)

sudo password: penguin123

DELETE THIS ONCE YOU MEMORIZE IT!`
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
║          TOP SECRET - ROOT ONLY                      ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  CONGRATULATIONS, AGENT!                             ║
║                                                      ║
║  You have successfully gained root access.           ║
║  Your mission is complete.                           ║
║                                                      ║
║  FLAG{sudo_master_2024}                              ║
║                                                      ║
║  "With great power comes great responsibility."      ║
║                      - Uncle Ben (and every sysadmin)║
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
                            content: `NUCLEAR CODES
=============
Just kidding :D

But seriously, this is a root-only file.
Good job getting here!`
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
            return { error: `ls: cannot access '${path}': No such file or directory` };
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
            return { error: `ls: cannot open directory '${path}': Permission denied` };
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
            return { error: `cd: ${path}: No such file or directory` };
        }

        if (node.type !== 'dir') {
            return { error: `cd: ${path}: Not a directory` };
        }

        // Check directory access permissions
        if (!this.canAccessDir(node)) {
            return { error: `cd: ${path}: Permission denied` };
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
        return { error: 'Sorry, try again. This incident will be reported.' };
    }

    // Exit sudo mode
    exitSudo() {
        this.isRoot = false;
    }

    // Read file content
    readFile(path) {
        const node = this.getNode(path);

        if (!node) {
            return { error: `cat: ${path}: No such file or directory` };
        }

        if (node.type === 'dir') {
            return { error: `cat: ${path}: Is a directory` };
        }

        // Check read permissions
        if (!this.canRead(node)) {
            return { error: `cat: ${path}: Permission denied` };
        }

        return { content: node.content, binary: node.binary };
    }

    // Get file info (for stat command)
    getFileInfo(path) {
        const node = this.getNode(path);
        const resolvedPath = this.resolvePath(path);

        if (!node) {
            return { error: `stat: cannot stat '${path}': No such file or directory` };
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
            return { error: `file: ${path}: No such file or directory` };
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
            return { error: `mkdir: cannot create directory '${path}': No such file or directory` };
        }

        if (parent.type !== 'dir') {
            return { error: `mkdir: cannot create directory '${path}': Not a directory` };
        }

        if (parent.children[dirName]) {
            return { error: `mkdir: cannot create directory '${path}': File exists` };
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
            return { error: `touch: cannot touch '${path}': No such file or directory` };
        }

        if (parent.type !== 'dir') {
            return { error: `touch: cannot touch '${path}': Not a directory` };
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
            return { error: `rm: cannot remove '${path}': No such file or directory` };
        }

        if (node.type === 'dir' && !options.recursive) {
            return { error: `rm: cannot remove '${path}': Is a directory (use -r)` };
        }

        if (node.type === 'dir' && Object.keys(node.children).length > 0 && !options.recursive) {
            return { error: `rm: cannot remove '${path}': Directory not empty` };
        }

        delete parent.children[name];
        return { success: true };
    }

    // Search files with grep
    grep(pattern, path, options = {}) {
        const node = this.getNode(path);

        if (!node) {
            return { error: `grep: ${path}: No such file or directory` };
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
                return { error: `grep: ${path}: Is a directory` };
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
