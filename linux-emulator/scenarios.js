// Security Scenarios for Linux Emulator

class ScenarioManager {
    constructor() {
        this.scenarios = {
            http_login: {
                name: 'HTTP přihlášení',
                description: 'Demonstrace zachycení hesla při HTTP přihlášení',
                instructions: `
<span class="output-warning">═══════════════════════════════════════════════════════</span>
<span class="output-warning">  SCÉNÁŘ: Zachycení hesla v HTTP provozu</span>
<span class="output-warning">═══════════════════════════════════════════════════════</span>

<span class="output-info">Situace:</span>
Uživatel se přihlašuje na webovou stránku přes HTTP (bez šifrování).
Útočník na stejné síti zachytává síťový provoz.

<span class="output-info">Kroky:</span>
1. Spusťte zachytávání provozu: <span class="output-command">tcpdump</span>
2. Simulujte HTTP přihlášení: <span class="output-command">http-login bank.example.com user123 tajneheslo</span>
3. Sledujte zachycené pakety v Network Monitoru níže

<span class="output-error">⚠ POZOR: V HTTP provozu jsou přihlašovací údaje viditelné jako plain text!</span>
`,
                autoCommands: []
            },

            https_login: {
                name: 'HTTPS přihlášení',
                description: 'Demonstrace šifrovaného přihlášení přes HTTPS',
                instructions: `
<span class="output-success">═══════════════════════════════════════════════════════</span>
<span class="output-success">  SCÉNÁŘ: Bezpečné přihlášení přes HTTPS</span>
<span class="output-success">═══════════════════════════════════════════════════════</span>

<span class="output-info">Situace:</span>
Uživatel se přihlašuje na webovou stránku přes HTTPS (šifrované spojení).
Útočník na stejné síti se pokouší zachytit provoz.

<span class="output-info">Kroky:</span>
1. Spusťte zachytávání provozu: <span class="output-command">tcpdump</span>
2. Simulujte HTTPS přihlášení: <span class="output-command">https-login bank.example.com user123 tajneheslo</span>
3. Sledujte zachycené pakety v Network Monitoru

<span class="output-success">✓ V HTTPS provozu jsou data šifrovaná - útočník vidí pouze nečitelný obsah!</span>
`,
                autoCommands: []
            },

            cookie_theft: {
                name: 'Krádež cookies',
                description: 'Demonstrace session hijacking přes HTTP',
                instructions: `
<span class="output-warning">═══════════════════════════════════════════════════════</span>
<span class="output-warning">  SCÉNÁŘ: Session Hijacking - Krádež cookies</span>
<span class="output-warning">═══════════════════════════════════════════════════════</span>

<span class="output-info">Situace:</span>
Webová stránka používá HTTP a odesílá session cookie bez šifrování.
Útočník může zachytit cookie a převzít session uživatele.

<span class="output-info">Kroky:</span>
1. Spusťte zachytávání: <span class="output-command">tcpdump</span>
2. Navštivte HTTP stránku: <span class="output-command">curl http://shop.example.com</span>
3. Sledujte Set-Cookie hlavičku v odpovědi

<span class="output-error">⚠ Session ID 'abc123def456' je viditelné v plain textu!</span>
<span class="output-error">⚠ Útočník může tuto hodnotu použít k převzetí session!</span>

<span class="output-info">Ochrana:</span>
- Používejte HTTPS
- Nastavte cookie flag 'Secure' a 'HttpOnly'
- Implementujte HSTS (HTTP Strict Transport Security)
`,
                autoCommands: []
            },

            dns_lookup: {
                name: 'DNS průzkum',
                description: 'Zjištění IP adres pomocí DNS',
                instructions: `
<span class="output-info">═══════════════════════════════════════════════════════</span>
<span class="output-info">  SCÉNÁŘ: DNS Průzkum sítě</span>
<span class="output-info">═══════════════════════════════════════════════════════</span>

<span class="output-info">Situace:</span>
Pomocí DNS lze zjistit IP adresy serverů a mapovat infrastrukturu.

<span class="output-info">Užitečné příkazy:</span>
• <span class="output-command">nslookup google.com</span> - Zjistí IP adresu domény
• <span class="output-command">nslookup github.com</span> - Další příklad
• <span class="output-command">cat /etc/hosts</span> - Lokální DNS záznamy
• <span class="output-command">cat /etc/resolv.conf</span> - DNS servery

<span class="output-info">Vyzkoušejte:</span>
1. <span class="output-command">nslookup bank.example.com</span>
2. <span class="output-command">ping bank.example.com</span>
3. <span class="output-command">traceroute google.com</span>
`,
                autoCommands: []
            },

            network_scan: {
                name: 'Síťový scan',
                description: 'Základní průzkum sítě',
                instructions: `
<span class="output-info">═══════════════════════════════════════════════════════</span>
<span class="output-info">  SCÉNÁŘ: Základní síťový průzkum</span>
<span class="output-info">═══════════════════════════════════════════════════════</span>

<span class="output-info">Kroky pro průzkum:</span>
1. Zjistěte své síťové nastavení: <span class="output-command">ifconfig</span>
2. Podívejte se na aktivní spojení: <span class="output-command">netstat</span>
3. Otestujte konektivitu: <span class="output-command">ping router.local</span>
4. Zjistěte cestu k serveru: <span class="output-command">traceroute google.com</span>

<span class="output-info">Zajímavé adresy v síti:</span>
• 192.168.1.1 - Router
• 192.168.1.100 - Webový server
• 192.168.1.101 - Databázový server
• 192.168.1.200 - Podezřelá adresa (útočník?)
`,
                autoCommands: []
            }
        };

        this.currentScenario = null;
    }

    getScenario(id) {
        return this.scenarios[id];
    }

    loadScenario(id) {
        const scenario = this.scenarios[id];
        if (!scenario) {
            return { error: `Neznámý scénář: ${id}` };
        }

        this.currentScenario = id;
        return {
            name: scenario.name,
            instructions: scenario.instructions
        };
    }

    getCurrentScenario() {
        return this.currentScenario ? this.scenarios[this.currentScenario] : null;
    }
}

// Export
const scenarios = new ScenarioManager();

// Global function to load scenario (called from HTML buttons)
function loadScenario(id) {
    const result = scenarios.loadScenario(id);
    if (result.error) {
        terminal.printError(result.error);
        return;
    }

    terminal.printHtml(result.instructions);

    // If this is a capture scenario, show the network monitor
    if (['http_login', 'https_login', 'cookie_theft'].includes(id)) {
        document.getElementById('networkMonitor').classList.add('visible');
    }
}
