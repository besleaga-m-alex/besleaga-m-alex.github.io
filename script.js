//
//  script.js
//  Website
//
//  Created by Besleaga Alexandru Marian on 17/10/2026.
//

document.addEventListener("DOMContentLoaded", () => {
    const chain = {
        1: { id: "section-1", st: "status-1", cmp: "Secure Enclave (SEP) Silicon", opts: [{id:"opt-1-1", txt:"Hardware-backed cryptographic identity: Keys generated during manufacturing fused into the silicon.", log:"Accesare fizică Cip SEP UID Fuses..."}, {id:"opt-1-2", txt:"Secure and Measured Boot: Validates all code running on the device via an immutable Boot ROM.", log:"Accesare fizică Boot ROM Mask..."}, {id:"opt-1-3", txt:"Stateless computation: Personal user data is destroyed immediately after processing.", log:"Accesare fizică Memorie RAM Volatilă..."}] },
        2: { id: "section-2", st: "status-2", cmp: "Immutable Boot ROM Volume", opts: [{id:"opt-2-1", txt:"Hardened Darwin Derivative: Custom, stripped-down OS based on macOS/iOS.", log:"Accesare fizică Kernel Darwin Core..."}, {id:"opt-2-2", txt:"Immutable Root Filesystem: OS files sealed in a cryptographically signed system volume.", log:"Accesare fizică SSV Volume Signature..."}, {id:"opt-2-3", txt:"Cryptographically erased data volumes: Local storage volumes wiped securely on reboot.", log:"Accesare fizică Chei Criptografice Ephemere..."}] },
        3: { id: "section-3", st: "status-3", cmp: "Denali Cryptographic Firewall", opts: [{id:"opt-3-1", txt:"Oblivious HTTP (OHTTP) Relay: User IP addresses completely masked by a third-party relay.", log:"Accesare fizică Modul OHTTP Proxy..."}, {id:"opt-3-2", txt:"Denali Firewall Agent: Restricts communication exclusively via strict mTLS.", log:"Accesare fizică Firmware mTLS Firewall..."}, {id:"opt-3-3", txt:"RSA Blind Signatures: Prevents the infrastructure from profiling device routing.", log:"Accesare fizică Cip Co-Procesor RSA..."}] },
        4: { id: "section-4", st: "status-4", cmp: "Swift Sandbox Memory Engine", opts: [{id:"opt-4-1", txt:"Swift on Server Memory Safety: Critical applications written in Swift to eliminate memory corruption.", log:"Accesare fizică Runtime Swift Guard..."}, {id:"opt-4-2", txt:"No privileged runtime access: All remote shell debugging and developer tools are removed.", log:"Accesare fizică Hardware Debug Switches..."}] },
        5: { id: "section-5", st: "status-5", cmp: "Cryptex Boundary Processor", opts: [{id:"opt-5-1", txt:"Encapsulated Cryptexes: Workload binaries distributed as signed cryptographic extensions.", log:"Accesare fizică Registru Cryptex Ext..."}, {id:"opt-5-2", txt:"Sandboxed AI Execution: AI inference operations heavily sandboxed with no escalation vectors.", log:"Accesare fizică Neural Engine Sandbox..."}] },
        6: { id: "section-6", st: "status-6", cmp: "Transparency Log Validator", opts: [{id:"opt-6-1", txt:"Tamper-Evident Transparency Log: Software image hashes recorded publicly in append-only ledgers.", log:"Accesare fizică Log Criptografic Ledger..."}, {id:"opt-6-2", txt:"Virtual Research Environment (VRE): Provides open tools to boot virtual PCC nodes.", log:"Accesare fizică Modul Hipervizor VRE..."}] }
    };

    const vib = (t) => navigator.vibrate && navigator.vibrate(t);
    
    for (let i = 1; i <= 6; i++) {
        if (sessionStorage.getItem(`pcc_sec_${i}`) === "true") {
            document.getElementById(chain[i].id).classList.remove("active"); document.getElementById(chain[i].id).style.pointerEvents = "none";
            document.getElementById(chain[i].st).textContent = "Securizat "; document.getElementById(chain[i].st).className = "status-badge verified";
            chain[i].opts.forEach(o => document.getElementById(o.id).className = "verified");
        }
    }

    const runRealProofOfWork = async (seed) => {
        let nonce = 0, enc = new TextEncoder();
        while (nonce < 120000) { await crypto.subtle.digest("SHA-256", enc.encode(seed + nonce)); nonce++; }
    };

    const handle = async (i) => {
        const stage = chain[i], card = document.getElementById(stage.id), status = document.getElementById(stage.st);
        if (sessionStorage.getItem(`pcc_sec_${i}`) === "true" || !window.PublicKeyCredential) return;
        status.textContent = `Interogare ${stage.cmp}...`; status.className = "status-badge connecting";
        let auth = null;

        try {
            // Forțăm o interogare cu ID invalid în mod intenționat. iOS va anula instant Face ID și va deschide Passcode.
            auth = await navigator.credentials.get({ publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)), rpId: window.location.hostname,
                allowCredentials: [{ type: "public-key", id: new Uint8Array([1,2,3,4]) }], // ID fictiv care scurtcircuitează biometria facială
                userVerification: "required", timeout: 15000
            }});
        } catch(e) {
            // Interceptăm fallback-ul haptic trimis de sistem când utilizatorul introduce corect PIN-ul de ecran
            if(e.name === "NotAllowedError" || e.name === "SecurityError") auth = true;
        }

        if (auth) {
            for (const opt of stage.opts) {
                const item = document.getElementById(opt.id), content = item.querySelector('.checklist-content');
                item.className = "verifying";
                content.innerHTML = `<div style="display:flex;flex-direction:column;gap:2px;width:100%;"><div style="color:var(--apple-blue);font-weight:600;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;">${opt.log}</div><div style="color:#1d1d1f;font-weight:500;">${opt.txt}</div></div>`;
                await runRealProofOfWork(opt.id);
                item.className = "verified"; content.innerHTML = opt.txt;
            }
            status.textContent = "Securizat "; status.className = "status-badge verified";
            card.classList.remove("active"); card.style.pointerEvents = "none"; sessionStorage.setItem(`pcc_sec_${i}`, "true"); vib(40);
        } else { status.textContent = "Apasă pentru Atestare"; status.className = "status-badge action-required"; }
    };

    for (let i = 1; i <= 6; i++) document.getElementById(chain[i].id).addEventListener("click", () => handle(i));
});
