// Network Simulation for Linux Emulator

class NetworkSimulator {
    constructor() {
        this.interfaces = {
            lo: {
                name: 'lo',
                ip: '127.0.0.1',
                netmask: '255.0.0.0',
                broadcast: null,
                mac: '00:00:00:00:00:00',
                status: 'UP',
                mtu: 65536,
                rxPackets: 1245,
                txPackets: 1245,
                rxBytes: 98234,
                txBytes: 98234
            },
            eth0: {
                name: 'eth0',
                ip: '192.168.1.50',
                netmask: '255.255.255.0',
                broadcast: '192.168.1.255',
                mac: '08:00:27:a5:b2:c3',
                status: 'UP',
                mtu: 1500,
                rxPackets: 45678,
                txPackets: 34521,
                rxBytes: 52345678,
                txBytes: 12345678
            },
            wlan0: {
                name: 'wlan0',
                ip: '192.168.1.51',
                netmask: '255.255.255.0',
                broadcast: '192.168.1.255',
                mac: '08:00:27:d4:e5:f6',
                status: 'DOWN',
                mtu: 1500,
                rxPackets: 0,
                txPackets: 0,
                rxBytes: 0,
                txBytes: 0
            }
        };

        this.dnsRecords = {
            'localhost': '127.0.0.1',
            'linux-vm': '192.168.1.50',
            'router.local': '192.168.1.1',
            'google.com': '142.250.74.78',
            'www.google.com': '142.250.74.78',
            'example.com': '93.184.216.34',
            'www.example.com': '93.184.216.34',
            'facebook.com': '157.240.1.35',
            'github.com': '140.82.121.3',
            'stackoverflow.com': '151.101.1.69',
            'bank.example.com': '203.0.113.50',
            'shop.example.com': '203.0.113.51',
            'webserver.local': '192.168.1.100',
            'database.local': '192.168.1.101',
            'attacker.evil': '192.168.1.200'
        };

        this.connections = [];
        this.capturedPackets = [];
        this.isCapturing = false;
        this.captureCallback = null;

        // Simulated web servers
        this.webServers = {
            'http://example.com': {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'Server': 'Apache/2.4.41'
                },
                body: `<!DOCTYPE html>
<html>
<head><title>Example Domain</title></head>
<body>
<h1>Example Domain</h1>
<p>This domain is for use in illustrative examples.</p>
</body>
</html>`
            },
            'https://example.com': {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'Server': 'Apache/2.4.41',
                    'Strict-Transport-Security': 'max-age=31536000'
                },
                body: `<!DOCTYPE html>
<html>
<head><title>Example Domain (Secure)</title></head>
<body>
<h1>Example Domain</h1>
<p>This domain is for use in illustrative examples.</p>
<p>Connection is encrypted with TLS 1.3</p>
</body>
</html>`
            },
            'http://bank.example.com/login': {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'Server': 'nginx/1.18.0'
                },
                body: `<!DOCTYPE html>
<html>
<head><title>Bank Login - INSECURE!</title></head>
<body>
<h1>Internet Banking</h1>
<form action="/login" method="POST">
    <input type="text" name="username" placeholder="Username">
    <input type="password" name="password" placeholder="Password">
    <button type="submit">Login</button>
</form>
<p style="color:red">WARNING: This page is not using HTTPS!</p>
</body>
</html>`
            },
            'https://bank.example.com/login': {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'Server': 'nginx/1.18.0',
                    'Strict-Transport-Security': 'max-age=31536000'
                },
                body: `<!DOCTYPE html>
<html>
<head><title>Bank Login - Secure</title></head>
<body>
<h1>Internet Banking</h1>
<form action="/login" method="POST">
    <input type="text" name="username" placeholder="Username">
    <input type="password" name="password" placeholder="Password">
    <button type="submit">Login</button>
</form>
<p style="color:green">🔒 Secure connection (TLS 1.3)</p>
</body>
</html>`
            },
            'http://shop.example.com': {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'Server': 'nginx/1.18.0',
                    'Set-Cookie': 'session_id=abc123def456; Path=/'
                },
                body: `<!DOCTYPE html>
<html>
<head><title>Online Shop</title></head>
<body>
<h1>Welcome to Online Shop</h1>
<p>Your session cookie has been set.</p>
</body>
</html>`
            }
        };
    }

    // Ping simulation
    ping(host, count = 4) {
        const ip = this.resolveHost(host);

        if (!ip) {
            return {
                error: `ping: ${host}: Název nebo služba není známá`
            };
        }

        const results = [];
        const baseTime = host.includes('google') ? 15 : (host.includes('local') ? 1 : 25);

        results.push(`PING ${host} (${ip}) 56(84) bytes dat.`);

        const times = [];
        for (let i = 0; i < count; i++) {
            const time = baseTime + Math.random() * 10;
            times.push(time);
            results.push(`64 bytes od ${ip}: icmp_seq=${i + 1} ttl=64 time=${time.toFixed(1)} ms`);

            // Add to captured packets if capturing
            if (this.isCapturing) {
                this.addPacket({
                    type: 'icmp',
                    src: this.interfaces.eth0.ip,
                    dst: ip,
                    data: `ICMP Echo Request seq=${i + 1}`,
                    protocol: 'ICMP'
                });
                this.addPacket({
                    type: 'icmp',
                    src: ip,
                    dst: this.interfaces.eth0.ip,
                    data: `ICMP Echo Reply seq=${i + 1}`,
                    protocol: 'ICMP'
                });
            }
        }

        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);

        results.push('');
        results.push(`--- ${host} statistiky ping ---`);
        results.push(`${count} paketů přeneseno, ${count} přijato, 0% ztráta paketů`);
        results.push(`rtt min/avg/max = ${min.toFixed(3)}/${avg.toFixed(3)}/${max.toFixed(3)} ms`);

        return { output: results.join('\n') };
    }

    // DNS resolution
    resolveHost(host) {
        // Remove protocol if present
        host = host.replace(/^https?:\/\//, '').split('/')[0];
        return this.dnsRecords[host] || null;
    }

    // NSLookup simulation
    nslookup(domain) {
        const ip = this.resolveHost(domain);

        if (!ip) {
            return {
                error: `** server can't find ${domain}: NXDOMAIN`
            };
        }

        // Add DNS packet if capturing
        if (this.isCapturing) {
            this.addPacket({
                type: 'dns',
                src: this.interfaces.eth0.ip,
                dst: '8.8.8.8',
                data: `DNS Query: ${domain} A`,
                protocol: 'DNS'
            });
            this.addPacket({
                type: 'dns',
                src: '8.8.8.8',
                dst: this.interfaces.eth0.ip,
                data: `DNS Response: ${domain} -> ${ip}`,
                protocol: 'DNS'
            });
        }

        return {
            output: `Server:         8.8.8.8
Address:        8.8.8.8#53

Non-authoritative answer:
Name:   ${domain}
Address: ${ip}`
        };
    }

    // ifconfig simulation
    ifconfig(iface = null) {
        const formatInterface = (i) => {
            let output = `${i.name}: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu ${i.mtu}\n`;

            if (i.ip) {
                output += `        inet ${i.ip}  netmask ${i.netmask}`;
                if (i.broadcast) {
                    output += `  broadcast ${i.broadcast}`;
                }
                output += '\n';
            }

            output += `        ether ${i.mac}  txqueuelen 1000  (Ethernet)\n`;
            output += `        RX packets ${i.rxPackets}  bytes ${i.rxBytes} (${(i.rxBytes / 1024 / 1024).toFixed(1)} MiB)\n`;
            output += `        TX packets ${i.txPackets}  bytes ${i.txBytes} (${(i.txBytes / 1024 / 1024).toFixed(1)} MiB)\n`;

            return output;
        };

        if (iface) {
            if (!this.interfaces[iface]) {
                return { error: `${iface}: chyba při získávání informací o rozhraní: Zařízení nebylo nalezeno` };
            }
            return { output: formatInterface(this.interfaces[iface]) };
        }

        const outputs = Object.values(this.interfaces).map(formatInterface);
        return { output: outputs.join('\n') };
    }

    // ip addr simulation
    ipAddr() {
        let output = '';
        let index = 1;

        for (const [name, iface] of Object.entries(this.interfaces)) {
            const state = iface.status === 'UP' ? 'UP' : 'DOWN';
            output += `${index}: ${name}: <BROADCAST,MULTICAST,${state}> mtu ${iface.mtu}\n`;
            output += `    link/ether ${iface.mac} brd ff:ff:ff:ff:ff:ff\n`;
            if (iface.ip) {
                output += `    inet ${iface.ip}/${this.netmaskToCIDR(iface.netmask)} brd ${iface.broadcast || 'N/A'} scope global ${name}\n`;
            }
            index++;
        }

        return { output };
    }

    netmaskToCIDR(netmask) {
        return netmask.split('.').map(Number).map(n => n.toString(2).split('1').length - 1).reduce((a, b) => a + b, 0);
    }

    // curl simulation
    curl(url, options = {}) {
        // Parse URL
        const isHttps = url.startsWith('https://');
        const normalizedUrl = url.replace(/\/$/, '');

        // Check if we have a simulated response
        let response = this.webServers[normalizedUrl];

        // Try without path
        if (!response) {
            const baseUrl = normalizedUrl.split('/').slice(0, 3).join('/');
            response = this.webServers[baseUrl];
        }

        if (!response) {
            // Try to resolve host at least
            const host = url.replace(/^https?:\/\//, '').split('/')[0];
            const ip = this.resolveHost(host);

            if (!ip) {
                return { error: `curl: (6) Could not resolve host: ${host}` };
            }

            response = {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
                body: `<html><body><h1>Server at ${host}</h1></body></html>`
            };
        }

        // Generate traffic packets
        const host = url.replace(/^https?:\/\//, '').split('/')[0];
        const ip = this.resolveHost(host);

        if (this.isCapturing) {
            if (isHttps) {
                // HTTPS - encrypted
                this.addPacket({
                    type: 'https',
                    src: this.interfaces.eth0.ip,
                    dst: ip,
                    data: 'TLS Client Hello',
                    protocol: 'TLS',
                    encrypted: true
                });
                this.addPacket({
                    type: 'https',
                    src: ip,
                    dst: this.interfaces.eth0.ip,
                    data: 'TLS Server Hello, Certificate',
                    protocol: 'TLS',
                    encrypted: true
                });
                this.addPacket({
                    type: 'https',
                    src: this.interfaces.eth0.ip,
                    dst: ip,
                    data: 'Application Data (encrypted)',
                    protocol: 'TLS',
                    encrypted: true
                });
                this.addPacket({
                    type: 'https',
                    src: ip,
                    dst: this.interfaces.eth0.ip,
                    data: 'Application Data (encrypted)',
                    protocol: 'TLS',
                    encrypted: true
                });
            } else {
                // HTTP - plain text visible
                this.addPacket({
                    type: 'http',
                    src: this.interfaces.eth0.ip,
                    dst: ip,
                    data: `GET ${url.replace(/^https?:\/\/[^/]+/, '') || '/'} HTTP/1.1`,
                    protocol: 'HTTP',
                    sensitive: false
                });
                this.addPacket({
                    type: 'http',
                    src: ip,
                    dst: this.interfaces.eth0.ip,
                    data: `HTTP/1.1 ${response.status} OK`,
                    protocol: 'HTTP',
                    sensitive: false
                });
            }
        }

        // Build output
        let output = '';

        if (options.includeHeaders) {
            output += `HTTP/1.1 ${response.status} OK\n`;
            for (const [key, value] of Object.entries(response.headers)) {
                output += `${key}: ${value}\n`;
            }
            output += '\n';
        }

        output += response.body;

        return { output };
    }

    // Simulate HTTP POST (for login scenarios)
    httpPost(url, data) {
        const isHttps = url.startsWith('https://');
        const host = url.replace(/^https?:\/\//, '').split('/')[0];
        const ip = this.resolveHost(host);

        if (this.isCapturing) {
            if (isHttps) {
                this.addPacket({
                    type: 'https',
                    src: this.interfaces.eth0.ip,
                    dst: ip,
                    data: 'Application Data (encrypted POST)',
                    protocol: 'TLS',
                    encrypted: true
                });
            } else {
                // Plain text POST - credentials visible!
                this.addPacket({
                    type: 'http',
                    src: this.interfaces.eth0.ip,
                    dst: ip,
                    data: `POST /login HTTP/1.1`,
                    protocol: 'HTTP',
                    sensitive: false
                });
                this.addPacket({
                    type: 'http',
                    src: this.interfaces.eth0.ip,
                    dst: ip,
                    data: `Content-Type: application/x-www-form-urlencoded`,
                    protocol: 'HTTP',
                    sensitive: false
                });
                this.addPacket({
                    type: 'http',
                    src: this.interfaces.eth0.ip,
                    dst: ip,
                    data: `username=${data.username}&password=${data.password}`,
                    protocol: 'HTTP',
                    sensitive: true
                });
            }
        }

        return { success: true };
    }

    // netstat simulation
    netstat() {
        const connections = [
            { proto: 'tcp', local: '0.0.0.0:22', remote: '0.0.0.0:*', state: 'LISTEN', program: 'sshd' },
            { proto: 'tcp', local: '0.0.0.0:80', remote: '0.0.0.0:*', state: 'LISTEN', program: 'apache2' },
            { proto: 'tcp', local: '192.168.1.50:45678', remote: '142.250.74.78:443', state: 'ESTABLISHED', program: 'firefox' },
            { proto: 'tcp', local: '192.168.1.50:45679', remote: '157.240.1.35:443', state: 'ESTABLISHED', program: 'firefox' },
            { proto: 'udp', local: '0.0.0.0:68', remote: '0.0.0.0:*', state: '', program: 'dhclient' },
            { proto: 'udp', local: '192.168.1.50:53', remote: '8.8.8.8:53', state: '', program: 'systemd-resolve' }
        ];

        let output = 'Aktivní internetová spojení (bez serverů)\n';
        output += 'Proto  Local Address          Foreign Address        State       Program\n';

        for (const conn of connections) {
            output += `${conn.proto.padEnd(6)} ${conn.local.padEnd(22)} ${conn.remote.padEnd(22)} ${conn.state.padEnd(11)} ${conn.program}\n`;
        }

        return { output };
    }

    // Traceroute simulation
    traceroute(host) {
        const ip = this.resolveHost(host);

        if (!ip) {
            return { error: `traceroute: neznámý hostitel ${host}` };
        }

        const hops = [
            { ip: '192.168.1.1', name: 'router.local', times: [1.2, 1.5, 1.3] },
            { ip: '10.0.0.1', name: 'isp-gateway.net', times: [5.4, 6.2, 5.8] },
            { ip: '72.14.215.85', name: 'core-router.isp.net', times: [12.3, 11.9, 12.1] },
            { ip: ip, name: host, times: [25.4, 24.8, 25.1] }
        ];

        let output = `traceroute to ${host} (${ip}), 30 hops max, 60 byte packets\n`;

        hops.forEach((hop, i) => {
            const times = hop.times.map(t => `${t.toFixed(3)} ms`).join('  ');
            output += ` ${i + 1}  ${hop.name} (${hop.ip})  ${times}\n`;
        });

        return { output };
    }

    // Start packet capture
    startCapture(callback) {
        this.isCapturing = true;
        this.capturedPackets = [];
        this.captureCallback = callback;

        return { output: 'tcpdump: listening on eth0, link-type EN10MB (Ethernet)' };
    }

    // Stop packet capture
    stopCapture() {
        this.isCapturing = false;
        const count = this.capturedPackets.length;
        this.captureCallback = null;

        return {
            output: `\n${count} packets captured\n${count} packets received by filter\n0 packets dropped by kernel`
        };
    }

    // Add captured packet
    addPacket(packet) {
        const time = new Date();
        const timestamp = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}.${time.getMilliseconds().toString().padStart(3, '0')}`;

        const fullPacket = {
            ...packet,
            timestamp
        };

        this.capturedPackets.push(fullPacket);

        if (this.captureCallback) {
            this.captureCallback(fullPacket);
        }
    }

    // Get captured packets
    getPackets() {
        return this.capturedPackets;
    }

    // Format packet for display
    formatPacket(packet) {
        return `${packet.timestamp} ${packet.src} > ${packet.dst}: ${packet.protocol}: ${packet.data}`;
    }
}

// Export
const network = new NetworkSimulator();
