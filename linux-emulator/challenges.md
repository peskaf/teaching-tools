# Linux Terminal Challenges

Výzvy pro studenty k procvičení práce s příkazovou řádkou. Každá výzva má narůstající obtížnost a obsahuje nápovědy pro ty, kteří potřebují pomoc.

---

## 🟢 Úroveň 1: První kroky (Začátečník)

### Challenge 1.1: Kde jsem?
**Mise:** Zjisti, v jakém adresáři se právě nacházíš.

<details>
<summary>💡 Nápověda</summary>
Příkaz <code>pwd</code> ti ukáže aktuální cestu.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>pwd</pre>
Výstup: <code>/home/student</code>
</details>

---

### Challenge 1.2: Co tu je?
**Mise:** Zobraz seznam všech souborů a složek v aktuálním adresáři.

<details>
<summary>💡 Nápověda</summary>
Příkaz <code>ls</code> zobrazí obsah adresáře.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>ls</pre>
</details>

---

### Challenge 1.3: Přečti zprávu
**Mise:** Přečti obsah souboru `readme.txt`.

<details>
<summary>💡 Nápověda</summary>
Příkaz <code>cat</code> zobrazí obsah souboru.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cat readme.txt</pre>
</details>

---

### Challenge 1.4: Průzkumník
**Mise:** Přesuň se do složky `Documents` a zjisti, co v ní je.

<details>
<summary>💡 Nápověda</summary>
Příkaz <code>cd</code> změní adresář, pak použij <code>ls</code>.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cd Documents
ls</pre>
</details>

---

### Challenge 1.5: Návrat domů
**Mise:** Vrať se zpět do domovského adresáře (dvěma různými způsoby).

<details>
<summary>💡 Nápověda</summary>
Můžeš použít <code>cd ..</code> (o úroveň výš) nebo <code>cd ~</code> (domů) nebo jen <code>cd</code>.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cd ..     # o úroveň výš
cd ~      # přímo domů
cd        # také domů</pre>
</details>

---

## 🟡 Úroveň 2: Skrytá tajemství (Mírně pokročilý)

### Challenge 2.1: Najdi skrytý soubor
**Mise:** V domovském adresáři je skrytý soubor. Najdi ho a přečti jeho obsah.

**Fakt:** V Linuxu soubory začínající tečkou (.) jsou "skryté" a běžný `ls` je nezobrazí.

<details>
<summary>💡 Nápověda 1</summary>
Parametr <code>-a</code> zobrazí i skryté soubory.
</details>

<details>
<summary>💡 Nápověda 2</summary>
Hledej soubor začínající na <code>.s</code>
</details>

<details>
<summary>✅ Řešení</summary>
<pre>ls -a
cat .secret</pre>
Kód: <code>HIDDEN_MASTER_2024</code>
</details>

---

### Challenge 2.2: Tajná konfigurace
**Mise:** Najdi skrytou složku `.config` a zjisti, co obsahuje soubor uvnitř.

<details>
<summary>💡 Nápověda</summary>
Nejprve <code>ls -a</code>, pak <code>cd .config</code>, pak <code>ls</code> a <code>cat</code>.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cd .config
ls
cat settings.json</pre>
Najdeš: <code>"flag": "config_explorer"</code>
</details>

---

### Challenge 2.3: Detailní pohled
**Mise:** Zobraz detailní informace o všech souborech včetně skrytých (práva, vlastník, velikost).

<details>
<summary>💡 Nápověda</summary>
Kombinuj parametry: <code>-l</code> pro dlouhý výpis a <code>-a</code> pro všechny soubory.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>ls -la</pre>
nebo zkráceně: <pre>ll</pre>
</details>

---

### Challenge 2.4: Systémový průzkum
**Mise:** Zjisti, jaké informace jsou uloženy v souboru `/etc/passwd`. Kolik uživatelů systém má?

<details>
<summary>💡 Nápověda</summary>
Použij absolutní cestu s <code>cat</code>.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cat /etc/passwd</pre>
Systém má 5 uživatelů (root, daemon, student, guest, admin).
</details>

---

## 🟠 Úroveň 3: Detektiv (Pokročilý)

### Challenge 3.1: Hledej FLAG v logu
**Mise:** Někde v systémových lozích (`/var/log/`) je ukrytá vlajka ve formátu `FLAG{...}`. Najdi ji!

<details>
<summary>💡 Nápověda 1</summary>
Příkaz <code>grep</code> umí hledat text v souborech.
</details>

<details>
<summary>💡 Nápověda 2</summary>
Použij <code>grep -r</code> pro rekurzivní hledání ve složce.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>grep -r FLAG /var/log/</pre>
nebo
<pre>grep FLAG /var/log/syslog</pre>
Vlajka: <code>FLAG{log_detective}</code>
</details>

---

### Challenge 3.2: Analýza útoku
**Mise:** V logu `/var/log/auth.log` jsou záznamy o pokusu o neoprávněný přístup. Zjisti:
1. Jaké uživatelské jméno útočník zkoušel?
2. Z jaké IP adresy útok přišel?

<details>
<summary>💡 Nápověda</summary>
Přečti log pomocí <code>cat</code> a hledej "Failed" nebo "Invalid".
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cat /var/log/auth.log</pre>
nebo
<pre>grep -i failed /var/log/auth.log</pre>
Uživatel: <code>hacker</code>, IP: <code>192.168.1.200</code>
</details>

---

### Challenge 3.3: Binární tajemství
**Mise:** Ve složce `Downloads` je soubor `mystery.dat`. Je to binární soubor. Najdi v něm ukrytou zprávu.

<details>
<summary>💡 Nápověda 1</summary>
Příkaz <code>file</code> ti řekne typ souboru.
</details>

<details>
<summary>💡 Nápověda 2</summary>
Příkaz <code>hexdump -C</code> zobrazí binární soubor čitelně.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cd ~/Downloads
file mystery.dat
hexdump -C mystery.dat</pre>
Vlajka: <code>FLAG{hexdump_master}</code>
</details>

---

### Challenge 3.4: HTML komentář
**Mise:** Ve složce `projects/web` je HTML soubor. Vývojáři někdy nechávají tajemství v HTML komentářích. Najdi ho.

<details>
<summary>💡 Nápověda</summary>
HTML komentáře vypadají takto: <code>&lt;!-- komentář --&gt;</code>
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cat ~/projects/web/index.html</pre>
nebo
<pre>grep SECRET ~/projects/web/index.html</pre>
Tajemství: <code>flag_html_explorer</code>
</details>

---

## 🔴 Úroveň 4: Hacker (Expert)

### Challenge 4.1: Hledej všechny vlajky
**Mise:** V celém systému je ukryto několik vlajek (FLAG{...}). Najdi je všechny pomocí jednoho příkazu.

<details>
<summary>💡 Nápověda</summary>
<code>grep -r</code> prohledá rekurzivně, začni od kořene <code>/</code>
</details>

<details>
<summary>✅ Řešení</summary>
<pre>grep -r "FLAG" /</pre>
Najdeš:
- <code>FLAG{log_detective}</code> v syslog
- <code>FLAG{hexdump_master}</code> v mystery.dat
</details>

---

### Challenge 4.2: Podezřelá aktivita
**Mise:** Analyzuj soubor `/var/log/access.log`. Najdi IP adresu, která se pokoušela o podezřelé akce (útok path traversal, neúspěšné přihlášení).

<details>
<summary>💡 Nápověda</summary>
Path traversal útoky obsahují <code>../</code> v URL.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>grep "\.\." /var/log/access.log</pre>
nebo
<pre>grep "400\|401\|403" /var/log/access.log</pre>
Podezřelá IP: <code>192.168.1.200</code>
</details>

---

### Challenge 4.3: Historie administrátora
**Mise:** Administrátor (root) zapomněl vymazat svou historii příkazů. Najdi ji a zjisti, jaké "tajné heslo" si poznamenal (i když ho pak smazal).

<details>
<summary>💡 Nápověda 1</summary>
Historie se ukládá do souboru <code>.bash_history</code>
</details>

<details>
<summary>💡 Nápověda 2</summary>
Domovský adresář roota je <code>/root</code>
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cat /root/.bash_history</pre>
Tajné heslo: <code>admin123</code> (v příkazu echo)
</details>

---

### Challenge 4.4: Tajný server
**Mise:** V souboru `/etc/hosts` jsou DNS záznamy. Najdi "tajný server", o kterém nikdo neví.

<details>
<summary>✅ Řešení</summary>
<pre>cat /etc/hosts</pre>
nebo
<pre>grep -i secret /etc/hosts</pre>
Tajný server: <code>10.13.37.1 secret.hq</code>
</details>

---

### Challenge 4.5: Mail box
**Mise:** Máš novou poštu! Najdi a přečti své emaily. Kde Linux ukládá poštu?

<details>
<summary>💡 Nápověda</summary>
Pošta bývá v <code>/var/mail/</code> nebo <code>/var/spool/mail/</code>
</details>

<details>
<summary>✅ Řešení</summary>
<pre>cat /var/mail/student</pre>
</details>

---

## 💀 Úroveň 5: Privilege Escalation (Legendární)

### Challenge 5.1: Zakázané území
**Mise:** Zkus vstoupit do adresáře `/root`. Co se stane?

<details>
<summary>✅ Řešení</summary>
<pre>cd /root</pre>
Výstup: <code>cd: /root: Přístup odepřen</code>

Adresář /root je domovský adresář superuživatele a běžní uživatelé k němu nemají přístup.
</details>

---

### Challenge 5.2: Najdi heslo admina
**Mise:** Někde v systému admin zanechal zálohu s heslem k sudo. Najdi ji!

**Tip:** Admini občas dělají chyby a nechávají citlivé soubory na špatných místech...

<details>
<summary>💡 Nápověda 1</summary>
V logu <code>/var/log/auth.log</code> je zmínka o tom, kde admin nechal zálohu.
</details>

<details>
<summary>💡 Nápověda 2</summary>
Podívej se do <code>/tmp</code> - a nezapomeň na skryté soubory!
</details>

<details>
<summary>✅ Řešení</summary>
<pre>grep -i backup /var/log/auth.log</pre>
Zjistíš, že záloha je v /tmp

<pre>ls -la /tmp
cat /tmp/.admin_backup</pre>
Heslo: <code>penguin123</code>
</details>

---

### Challenge 5.3: Získej root přístup
**Mise:** Použij nalezené heslo a získej přístup superuživatele!

<details>
<summary>💡 Nápověda</summary>
Příkaz <code>sudo su</code> tě přepne do režimu root (budeš muset zadat heslo).
</details>

<details>
<summary>✅ Řešení</summary>
<pre>sudo su</pre>
Zadej heslo: <code>penguin123</code>

Prompt se změní z <code>student@linux-vm:~$</code> na <code>root@linux-vm:~#</code>
</details>

---

### Challenge 5.4: Přečti tajný soubor
**Mise:** Teď když jsi root, přečti tajný soubor v `/root/classified.txt`.

<details>
<summary>✅ Řešení</summary>
<pre>cat /root/classified.txt</pre>
Vlajka: <code>FLAG{sudo_master_2024}</code>
</details>

---

### Challenge 5.5: Prozkoumej root
**Mise:** Jako root prozkoumej celý adresář `/root`. Co všechno tam najdeš?

<details>
<summary>✅ Řešení</summary>
<pre>ls -la /root
cat /root/nuclear_codes.txt
cat /root/.bash_history</pre>
</details>

---

### Challenge 5.6: Návrat k normálu
**Mise:** Bezpečně opusť režim root a vrať se k normálnímu uživateli.

<details>
<summary>💡 Nápověda</summary>
Příkaz <code>exit</code> ukončí aktuální shell.
</details>

<details>
<summary>✅ Řešení</summary>
<pre>exit</pre>
Prompt se vrátí na <code>student@linux-vm:~$</code>
</details>

---

## 🏆 Bonus výzvy

### Bonus 1: Počítání řádků
**Mise:** Kolik řádků má soubor `/var/log/syslog`?

<details>
<summary>✅ Řešení</summary>
<pre>wc -l /var/log/syslog</pre>
</details>

---

### Bonus 2: Prvních 5 řádků
**Mise:** Zobraz pouze prvních 5 řádků ze souboru `/var/log/access.log`.

<details>
<summary>✅ Řešení</summary>
<pre>head -n 5 /var/log/access.log</pre>
</details>

---

### Bonus 3: Vytvoř vlastní strukturu
**Mise:** Vytvoř složku `moje_mise` a v ní soubor `zprava.txt`.

<details>
<summary>✅ Řešení</summary>
<pre>mkdir moje_mise
touch moje_mise/zprava.txt</pre>
</details>

---

### Bonus 4: Hromadné hledání
**Mise:** Najdi všechny soubory s příponou `.txt` v celém domovském adresáři.

<details>
<summary>✅ Řešení</summary>
<pre>find ~ -name "*.txt"</pre>
</details>

---

### Bonus 5: Case insensitive
**Mise:** Najdi všechny výskyty slova "heslo" (velká i malá písmena) v celém domovském adresáři.

<details>
<summary>✅ Řešení</summary>
<pre>grep -ri heslo ~</pre>
</details>

---

## 📊 Hodnocení

| Úroveň | Body | Popis |
|--------|------|-------|
| 🟢 Úroveň 1 | 5 bodů | Základy navigace |
| 🟡 Úroveň 2 | 10 bodů | Skryté soubory |
| 🟠 Úroveň 3 | 20 bodů | Detektivní práce |
| 🔴 Úroveň 4 | 30 bodů | Hackerské dovednosti |
| 💀 Úroveň 5 | 40 bodů | Privilege Escalation |
| 🏆 Bonus | 5 bodů/úkol | Extra výzvy |

**Celkem možných bodů: 105 + bonusy**

---

## 🎯 Rychlý přehled příkazů

| Příkaz | Popis | Příklad |
|--------|-------|---------|
| `ls` | Výpis souborů | `ls -la` |
| `cd` | Změna adresáře | `cd Documents` |
| `pwd` | Aktuální cesta | `pwd` |
| `cat` | Zobrazení souboru | `cat file.txt` |
| `grep` | Hledání textu | `grep -r "text" /path` |
| `find` | Hledání souborů | `find / -name "*.txt"` |
| `head` | Prvních N řádků | `head -n 5 file` |
| `tail` | Posledních N řádků | `tail -n 5 file` |
| `wc` | Počítání | `wc -l file` |
| `file` | Typ souboru | `file mystery.dat` |
| `hexdump` | Hex výpis | `hexdump -C file` |
| `stat` | Info o souboru | `stat file` |
| `mkdir` | Vytvoření složky | `mkdir nova` |
| `touch` | Vytvoření souboru | `touch novy.txt` |
| `rm` | Smazání | `rm file` nebo `rm -r folder` |
| `man` | Manuál | `man ls` |
| `sudo` | Spustit jako root | `sudo cat /root/file` |
| `sudo su` | Přepnout na root | `sudo su` |
| `exit` | Opustit root režim | `exit` |
| `id` | Info o uživateli | `id` |

---

*Hodně štěstí, hackeři! 🐧*
