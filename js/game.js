
class SpyGame {
    constructor() {
        this.storageKey = 'operation_zero_save_v2';
        this.typewriterTimeout = null;
        this.isTyping = false;
        this.audioTypewriterTimeout = null;

        this.defaultState = {
            xp: 0,
            missionUnlocked: 1,
            level1Completed: false,
            achievement: 'ROOKIE DETECTIVE',
            clue1: { solved: false, attempts: 0 },
            clue2: { solved: false, attempts: 0 },
            clue3: {
                q1: null,
                q2: null,
                q3: null,
                solved: false
            },
            evidenceCollectedModalShown: false,
            finalReportAccepted: false,
            secretRoomUnlocked: false,
            recordingPlayed: false,
            evidenceNotebook: [],
            stats: {
                hintsUsed: 0,
                startTime: null,
                completedTime: null
            }
        };

        this.state = this.loadState();
        this.init();
    }

    loadState() {
        try {

            let raw = localStorage.getItem(this.storageKey);
            if (!raw) raw = localStorage.getItem('operation_zero_save_v1');
            if (raw) {
                const parsed = JSON.parse(raw);
                return { ...this.defaultState, ...parsed };
            }
        } catch (e) {
            console.error('Failed to parse save data', e);
        }
        return JSON.parse(JSON.stringify(this.defaultState));
    }

    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state', e);
        }
        this.updateHUD();
    }

    resetProgress() {
        this.state = JSON.parse(JSON.stringify(this.defaultState));
        this.saveState();
        localStorage.removeItem('operation_zero_save_v1');
        window.soundFX.folderOpen();
        window.location.reload();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateHUD();
        this.restoreGameProgressUI();

        if (this.state.level1Completed) {
            this.markLevel1CompleteUI();
        }
    }

    cacheDOM() {

        this.screens = {
            landing: document.getElementById('screen-landing'),
            briefing: document.getElementById('screen-briefing'),
            investigation: document.getElementById('screen-investigation'),
            evidenceBoard: document.getElementById('screen-evidence-board'),
            finalInvestigation: document.getElementById('screen-final-investigation'),
            secretRoom: document.getElementById('screen-secret-room'),
            debriefingModal: document.getElementById('debriefing-modal'),
            resetModal: document.getElementById('reset-modal'),
            hintModal: document.getElementById('hint-modal'),
            evidenceCollectedModal: document.getElementById('modal-evidence-collected'),
            evidenceDetailModal: document.getElementById('modal-evidence-detail')
        };

        this.btnStartLvl1 = document.getElementById('btn-start-lvl1');
        this.btnAcceptMission = document.getElementById('btn-accept-mission');
        this.btnBackBriefing = document.getElementById('btn-back-briefing');
        this.btnBackHQ = document.getElementById('btn-back-hq');
        this.btnAudioToggle = document.getElementById('btn-audio-toggle');
        this.btnResetProgress = document.getElementById('btn-reset-progress');
        this.btnConfirmReset = document.getElementById('btn-confirm-reset');
        this.btnCancelReset = document.getElementById('btn-cancel-reset');
        this.btnSkipTyping = document.getElementById('btn-skip-typing');
        this.btnGlobalHint = document.getElementById('btn-global-hint');
        this.btnCloseHint = document.getElementById('btn-close-hint');
        this.btnCloseDebrief = document.getElementById('btn-close-debrief');
        this.btnReturnOperations = document.getElementById('btn-return-operations');

        this.btnOpenEvidenceBoard = document.getElementById('btn-open-evidence-board');
        this.cardBoardPrompt = document.getElementById('card-board-prompt');
        this.btnGotoEvidenceBoard = document.getElementById('btn-goto-evidence-board');
        this.btnContinueToBoard = document.getElementById('btn-continue-to-board');

        this.btnBoardBackWorkstation = document.getElementById('btn-board-back-workstation');
        this.btnStartFinalInvestigation = document.getElementById('btn-start-final-investigation');
        this.btnStartFinalInvestigationBottom = document.getElementById('btn-start-final-investigation-bottom');
        this.nexusCard1 = document.getElementById('nexus-card-1');
        this.nexusCard2 = document.getElementById('nexus-card-2');
        this.nexusCard3 = document.getElementById('nexus-card-3');
        this.btnCloseEvidenceDetail = document.getElementById('btn-close-evidence-detail');
        this.btnCloseEvidenceDetailBtn = document.getElementById('btn-close-evidence-detail-btn');
        this.evidenceDetailTag = document.getElementById('evidence-detail-tag');
        this.evidenceDetailTitle = document.getElementById('evidence-detail-title');
        this.evidenceDetailContent = document.getElementById('evidence-detail-content');

        this.btnFinalBackBoard = document.getElementById('btn-final-back-board');
        this.finalInputCode = document.getElementById('final-access-code');
        this.finalReasoningText = document.getElementById('final-reasoning-text');
        this.btnSubmitFinal = document.getElementById('btn-submit-final');
        this.finalFeedback = document.getElementById('final-feedback');
        this.bannerReportAccepted = document.getElementById('banner-report-accepted');

        this.secretKeypadScreen = document.getElementById('secret-keypad-screen');
        this.secretBoltBar = document.getElementById('secret-bolt-bar');
        this.secretBlastDoors = document.getElementById('secret-blast-doors');
        this.secretChamberContent = document.getElementById('secret-chamber-content');
        this.audioTypewriterText = document.getElementById('audio-typewriter-text');
        this.audioVisualizerBars = document.getElementById('audio-visualizer-bars');
        this.btnReplayAudio = document.getElementById('btn-replay-audio');
        this.btnOpenDebriefReport = document.getElementById('btn-open-debrief-report');

        this.hudXP = document.querySelectorAll('.hud-xp-val');
        this.hudRank = document.querySelectorAll('.hud-rank-val');
        this.hudProgressText = document.getElementById('hud-progress-text');
        this.hudProgressBar = document.getElementById('hud-progress-fill');
        this.evidenceList = document.getElementById('evidence-log-list');

        this.clue1Card = document.getElementById('card-clue-1');
        this.clue1Input = document.getElementById('input-clue-1');
        this.btnSubmitClue1 = document.getElementById('btn-submit-clue-1');
        this.clue1Feedback = document.getElementById('feedback-clue-1');
        this.btnToggleBinaryHelper = document.getElementById('btn-toggle-binary-helper');
        this.binaryHelperBox = document.getElementById('binary-helper-box');

        this.clue2Card = document.getElementById('card-clue-2');
        this.clue2Input = document.getElementById('input-clue-2');
        this.btnSubmitClue2 = document.getElementById('btn-submit-clue-2');
        this.clue2Feedback = document.getElementById('feedback-clue-2');
        this.btnToggleCipherHelper = document.getElementById('btn-toggle-cipher-helper');
        this.cipherHelperBox = document.getElementById('cipher-helper-box');

        this.clue3Card = document.getElementById('card-clue-3');
        this.btnRunPython = document.getElementById('btn-run-python');
        this.pythonTerminalOutput = document.getElementById('python-terminal-output');
        this.clue3Feedback = document.getElementById('feedback-clue-3');
        this.q1Options = document.querySelectorAll('input[name="q1"]');
        this.q2Options = document.querySelectorAll('input[name="q2"]');
        this.q3Options = document.querySelectorAll('input[name="q3"]');
    }

    bindEvents() {

        if (this.btnAudioToggle) {
            this.btnAudioToggle.addEventListener('click', () => {
                const enabled = window.soundFX.toggle();
                this.updateAudioButtonUI(enabled);
            });
            this.updateAudioButtonUI(window.soundFX.enabled);
        }

        if (this.btnStartLvl1) {
            this.btnStartLvl1.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.showScreen('briefing');
                this.startBriefingTypewriter();
            });
        }

        if (this.btnBackBriefing) {
            this.btnBackBriefing.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.showScreen('landing');
            });
        }

        if (this.btnAcceptMission) {
            this.btnAcceptMission.addEventListener('click', () => {
                window.soundFX.folderOpen();
                if (!this.state.stats.startTime) {
                    this.state.stats.startTime = Date.now();
                    this.saveState();
                }
                this.showScreen('investigation');
            });
        }

        if (this.btnBackHQ) {
            this.btnBackHQ.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.showScreen('landing');
            });
        }

        if (this.btnSkipTyping) {
            this.btnSkipTyping.addEventListener('click', () => {
                window.soundFX.keyClick();
                this.skipTypewriter();
            });
        }

        if (this.btnOpenEvidenceBoard) {
            this.btnOpenEvidenceBoard.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.showScreen('evidenceBoard');
            });
        }

        if (this.btnGotoEvidenceBoard) {
            this.btnGotoEvidenceBoard.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.showScreen('evidenceBoard');
            });
        }

        if (this.btnContinueToBoard) {
            this.btnContinueToBoard.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.screens.evidenceCollectedModal.classList.remove('active');
                this.showScreen('evidenceBoard');
            });
        }

        if (this.btnBoardBackWorkstation) {
            this.btnBoardBackWorkstation.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.showScreen('investigation');
            });
        }

        const triggerFinal = () => {
            window.soundFX.buttonClick();
            this.showScreen('finalInvestigation');
        };
        if (this.btnStartFinalInvestigation) this.btnStartFinalInvestigation.addEventListener('click', triggerFinal);
        if (this.btnStartFinalInvestigationBottom) this.btnStartFinalInvestigationBottom.addEventListener('click', triggerFinal);

        if (this.btnFinalBackBoard) {
            this.btnFinalBackBoard.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.showScreen('evidenceBoard');
            });
        }

        if (this.nexusCard1) {
            this.nexusCard1.addEventListener('click', () => this.inspectEvidenceDetail(1));
        }
        if (this.nexusCard2) {
            this.nexusCard2.addEventListener('click', () => this.inspectEvidenceDetail(2));
        }
        if (this.nexusCard3) {
            this.nexusCard3.addEventListener('click', () => this.inspectEvidenceDetail(3));
        }
        if (this.btnCloseEvidenceDetail) {
            this.btnCloseEvidenceDetail.addEventListener('click', () => this.screens.evidenceDetailModal.classList.remove('active'));
        }
        if (this.btnCloseEvidenceDetailBtn) {
            this.btnCloseEvidenceDetailBtn.addEventListener('click', () => this.screens.evidenceDetailModal.classList.remove('active'));
        }

        if (this.btnResetProgress) {
            this.btnResetProgress.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.screens.resetModal.classList.add('active');
            });
        }
        if (this.btnCancelReset) {
            this.btnCancelReset.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.screens.resetModal.classList.remove('active');
            });
        }
        if (this.btnConfirmReset) {
            this.btnConfirmReset.addEventListener('click', () => {
                this.resetProgress();
            });
        }

        if (this.btnGlobalHint) {
            this.btnGlobalHint.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.openHintModal();
            });
        }
        if (this.btnCloseHint) {
            this.btnCloseHint.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.screens.hintModal.classList.remove('active');
            });
        }

        if (this.btnCloseDebrief) {
            this.btnCloseDebrief.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.screens.debriefingModal.classList.remove('active');
            });
        }
        if (this.btnReturnOperations) {
            this.btnReturnOperations.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.screens.debriefingModal.classList.remove('active');
                this.showScreen('landing');
            });
        }

        if (this.btnReplayAudio) {
            this.btnReplayAudio.addEventListener('click', () => {
                this.playAlexRecording();
            });
        }
        if (this.btnOpenDebriefReport) {
            this.btnOpenDebriefReport.addEventListener('click', () => {
                this.showDebriefingModal();
            });
        }

        document.querySelectorAll('input[type="text"], textarea').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') {
                    window.soundFX.keyClick();
                }
            });
        });

        if (this.btnSubmitClue1) {
            this.btnSubmitClue1.addEventListener('click', () => this.validateClue1());
        }
        if (this.clue1Input) {
            this.clue1Input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.validateClue1();
            });
        }
        if (this.btnToggleBinaryHelper) {
            this.btnToggleBinaryHelper.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.binaryHelperBox.classList.toggle('hidden');
            });
        }

        if (this.btnSubmitClue2) {
            this.btnSubmitClue2.addEventListener('click', () => this.validateClue2());
        }
        if (this.clue2Input) {
            this.clue2Input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.validateClue2();
            });
        }
        if (this.btnToggleCipherHelper) {
            this.btnToggleCipherHelper.addEventListener('click', () => {
                window.soundFX.buttonClick();
                this.cipherHelperBox.classList.toggle('hidden');
            });
        }

        if (this.btnRunPython) {
            this.btnRunPython.addEventListener('click', () => this.simulatePythonRun());
        }
        [this.q1Options, this.q2Options, this.q3Options].forEach(group => {
            group.forEach(radio => {
                radio.addEventListener('change', () => this.handleClue3QuestionChange());
            });
        });

        if (this.btnSubmitFinal) {
            this.btnSubmitFinal.addEventListener('click', () => this.validateFinalInvestigation());
        }

        const lvl2Card = document.getElementById('card-lvl2');
        if (lvl2Card) {
            lvl2Card.addEventListener('click', () => {
                window.soundFX.accessDenied();
                this.showFlashNotification("ACCESS RESTRICTED: Level 02 is currently locked by High Command.", "warning");
            });
        }
    }

    updateAudioButtonUI(enabled) {
        if (!this.btnAudioToggle) return;
        this.btnAudioToggle.innerHTML = enabled
            ? `<span class="icon">🔊</span> AUDIO: ON`
            : `<span class="icon">🔇</span> AUDIO: OFF`;
        this.btnAudioToggle.classList.toggle('muted', !enabled);
    }

    showScreen(screenId) {
        Object.keys(this.screens).forEach(key => {
            if (this.screens[key] && this.screens[key].classList.contains('game-screen')) {
                this.screens[key].classList.remove('active');
            }
        });
        if (this.screens[screenId]) {
            this.screens[screenId].classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    startBriefingTypewriter() {
        const typewriterEl = document.getElementById('typewriter-text');
        if (!typewriterEl) return;

        const fullStory = `Three days ago, Agent Alex Morgan disappeared while investigating a secret cybercrime organization known as Shadow Protocol.

Before disappearing, Alex managed to send one final message to the agency:

"Someone inside our team is working with Shadow Protocol. I've left three clues. Find them before it's too late."

The agency has identified three people who had access to Alex's confidential files:

• Daniel – Junior Programmer
• Sarah – Security Analyst
• Marcus – Network Administrator

You are the newly recruited investigator. Your job is to find the traitor and recover the secret access code.`;

        typewriterEl.innerHTML = '';
        this.isTyping = true;
        let index = 0;
        if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);

        const typeChar = () => {
            if (!this.isTyping) return;
            if (index < fullStory.length) {
                const char = fullStory.charAt(index);
                if (char === '\n') {
                    typewriterEl.innerHTML += '<br>';
                } else {
                    typewriterEl.innerHTML += char;
                }
                index++;
                if (index % 4 === 0) window.soundFX.keyClick();
                this.typewriterTimeout = setTimeout(typeChar, 14);
            } else {
                this.isTyping = false;
                if (this.btnSkipTyping) this.btnSkipTyping.style.display = 'none';
            }
        };

        if (this.btnSkipTyping) this.btnSkipTyping.style.display = 'inline-block';
        typeChar();
    }

    skipTypewriter() {
        const typewriterEl = document.getElementById('typewriter-text');
        if (!typewriterEl) return;
        this.isTyping = false;
        if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);

        typewriterEl.innerHTML = `Three days ago, Agent Alex Morgan disappeared while investigating a secret cybercrime organization known as Shadow Protocol.<br><br>` +
            `Before disappearing, Alex managed to send one final message to the agency:<br><br>` +
            `<em>"Someone inside our team is working with Shadow Protocol. I've left three clues. Find them before it's too late."</em><br><br>` +
            `The agency has identified three people who had access to Alex's confidential files:<br><br>` +
            `• <strong>Daniel</strong> – Junior Programmer<br>` +
            `• <strong>Sarah</strong> – Security Analyst<br>` +
            `• <strong>Marcus</strong> – Network Administrator<br><br>` +
            `You are the newly recruited investigator. Your job is to find the traitor and recover the secret access code.`;

        if (this.btnSkipTyping) this.btnSkipTyping.style.display = 'none';
    }

    validateClue1() {
        if (this.state.clue1.solved) return;
        const val = this.clue1Input.value.trim().toUpperCase();
        this.state.clue1.attempts++;

        if (val === 'HELP') {
            window.soundFX.accessGranted();
            this.state.clue1.solved = true;
            this.addXP(100);
            this.addEvidence("CLUE 01 DECRYPTED", "Decoded message_01.txt: Distress signal 'HELP'. Alex confirmed an emergency distress beacon.");
            this.showClue1Success();
            this.unlockClue2();
            this.saveState();
        } else {
            window.soundFX.accessDenied();
            this.showFeedback(this.clue1Feedback, "DECRYPTION FAILED. Expected an emergency 4-letter distress signal.", "error");
        }
    }

    showClue1Success() {
        this.clue1Input.disabled = true;
        this.btnSubmitClue1.disabled = true;
        this.clue1Card.classList.add('solved');
        this.clue1Feedback.className = 'feedback-box success-feedback visible';
        this.clue1Feedback.innerHTML = `
            <div class="feedback-header">
                <span class="icon">✔</span> DECRYPTION SUCCESSFUL (+100 XP)
            </div>
            <div class="feedback-body">
                <p style="font-size: 1.05rem; margin-bottom: 8px;">
                    <strong style="color: var(--amber-neon);">CINEMATIC INTEL:</strong>
                    <span class="highlight-cyan" style="font-size: 1.15rem;">"A distress signal has been recovered."</span>
                </p>
                <p><strong>Decoded Message:</strong> <span class="highlight-cyan">HELP</span></p>
                <div class="intel-brief">
                    <strong>Intelligence Debrief (Binary-to-Text Conversion):</strong>
                    <p>Computers represent data in electronic circuits using binary (0 and 1). In the <strong>ASCII standard</strong>, numbers are assigned to characters:</p>
                    <div class="ascii-breakdown">
                        <span>01001000 = 72 = <strong>'H'</strong></span>
                        <span>01000101 = 69 = <strong>'E'</strong></span>
                        <span>01001100 = 76 = <strong>'L'</strong></span>
                        <span>01010000 = 80 = <strong>'P'</strong></span>
                    </div>
                </div>
            </div>
        `;
    }

    unlockClue2() {
        this.clue2Card.classList.remove('locked');
        this.clue2Card.classList.add('active');
        const badge = this.clue2Card.querySelector('.clue-status-tag');
        if (badge) {
            badge.textContent = 'ACTIVE';
            badge.className = 'clue-status-tag status-active';
        }
        this.clue2Input.disabled = false;
        this.btnSubmitClue2.disabled = false;
    }

    validateClue2() {
        if (!this.state.clue1.solved) {
            this.showFeedback(this.clue2Feedback, "LOCKED: Solve Clue 01 first.", "warning");
            return;
        }
        if (this.state.clue2.solved) return;

        const cleanVal = this.clue2Input.value
            .trim()
            .toUpperCase()
            .replace(/[^A-Z\s]/g, '')
            .replace(/\s+/g, ' ');

        this.state.clue2.attempts++;

        if (cleanVal === 'LOOK AT THE DOOR') {
            window.soundFX.accessGranted();
            this.state.clue2.solved = true;
            this.addXP(150);
            this.addEvidence("CLUE 02 DECRYPTED", "Decrypted Caesar Cipher: 'LOOK AT THE DOOR'. Alex has hidden critical evidence behind the facility's secure door.");
            this.showClue2Success();
            this.unlockClue3();
            this.saveState();
        } else {
            window.soundFX.accessDenied();
            this.showFeedback(this.clue2Feedback, "CIPHER MISMATCH. Remember each letter was shifted three positions forward. Move three positions backward (O → L, R → O, etc.).", "error");
        }
    }

    showClue2Success() {
        this.clue2Input.disabled = true;
        this.btnSubmitClue2.disabled = true;
        this.clue2Card.classList.add('solved');
        this.clue2Feedback.className = 'feedback-box success-feedback visible';
        this.clue2Feedback.innerHTML = `
            <div class="feedback-header">
                <span class="icon">✔</span> CIPHER CRACKED (+150 XP)
            </div>
            <div class="feedback-body">
                <p style="font-size: 1.05rem; margin-bottom: 8px;">
                    <strong style="color: var(--amber-neon);">CINEMATIC INTEL:</strong>
                    <span class="highlight-cyan" style="font-size: 1.15rem;">"Alex may have hidden something behind a secure door."</span>
                </p>
                <p><strong>Decrypted Directive:</strong> <span class="highlight-cyan">LOOK AT THE DOOR</span></p>
                <div class="intel-brief">
                    <strong>Intelligence Debrief (Caesar Cipher):</strong>
                    <p>A classic substitution cipher where letters in the alphabet are shifted by a fixed key (Shift = 3 backward):</p>
                    <div class="cipher-breakdown">
                        <span>O (-3) → <strong>L</strong></span>
                        <span>R (-3) → <strong>O</strong></span>
                        <span>R (-3) → <strong>O</strong></span>
                        <span>N (-3) → <strong>K</strong></span>
                        <span class="spacer">|</span>
                        <span>D (-3) → <strong>A</strong></span>
                        <span>W (-3) → <strong>T</strong></span>
                        <span class="spacer">|</span>
                        <span>W (-3) → <strong>T</strong></span>
                        <span>K (-3) → <strong>H</strong></span>
                        <span>H (-3) → <strong>E</strong></span>
                        <span class="spacer">|</span>
                        <span>G (-3) → <strong>D</strong></span>
                        <span>R (-3) → <strong>O</strong></span>
                        <span>R (-3) → <strong>O</strong></span>
                        <span>U (-3) → <strong>R</strong></span>
                    </div>
                </div>
            </div>
        `;
    }

    unlockClue3() {
        this.clue3Card.classList.remove('locked');
        this.clue3Card.classList.add('active');
        const badge = this.clue3Card.querySelector('.clue-status-tag');
        if (badge) {
            badge.textContent = 'ACTIVE';
            badge.className = 'clue-status-tag status-active';
        }
        this.btnRunPython.disabled = false;
        document.querySelectorAll('.clue3-input').forEach(i => i.disabled = false);
    }

    simulatePythonRun() {
        window.soundFX.keyClick();
        this.pythonTerminalOutput.innerHTML = `<span class="prompt">$</span> python3 verify_suspects.py\n<span class="evaluating">[EXECUTING RUNTIME...]</span>`;
        this.btnRunPython.disabled = true;

        setTimeout(() => {
            window.soundFX.buttonClick();
            this.pythonTerminalOutput.innerHTML = `
<span class="prompt">$</span> python3 verify_suspects.py
<span class="text-muted">[Scanning suspects dictionary: 3 records found]</span>
Checking Daniel (Code: 15) ... No match
Checking Sarah  (Code: 27) ... No match
Checking Marcus (Code: 42) ... <span class="highlight-green">MATCH FOUND!</span>
----------------------------------------
<span class="highlight-cyan">Suspect found: Marcus</span>
<span class="text-muted">Process finished with exit code 0</span>`;
            this.btnRunPython.disabled = false;
        }, 600);
    }

    handleClue3QuestionChange() {
        const q1 = document.querySelector('input[name="q1"]:checked')?.value;
        const q2 = document.querySelector('input[name="q2"]:checked')?.value;
        const q3 = document.querySelector('input[name="q3"]:checked')?.value;

        window.soundFX.keyClick();

        if (!q1 || !q2 || !q3) {
            return;
        }

        const isQ1Correct = q1 === 'dictionary-map';
        const isQ2Correct = q2 === 'loop-pairs';
        const isQ3Correct = q3 === 'marcus';

        if (isQ1Correct && isQ2Correct && isQ3Correct) {
            if (!this.state.clue3.solved) {
                window.soundFX.accessGranted();
                this.state.clue3.solved = true;
                this.addXP(200);
                this.addEvidence("CLUE 03 RECOVERED", "Python audit verified: Credential passkey 42 matches Marcus. Primary suspect identified, though not proven mastermind.");
                this.showClue3Success();
                this.saveState();

                setTimeout(() => {
                    this.showEvidenceCollectedModal();
                }, 800);
            }
        } else {
            let feedback = "ANALYSIS INCOMPLETE: ";
            if (!isQ1Correct) feedback += "Review Q1 (what does a Python dictionary store?). ";
            if (!isQ2Correct) feedback += "Review Q2 (suspects.items() iterates key-value pairs). ";
            if (!isQ3Correct) feedback += "Review Q3 (run the script to observe the final output).";
            this.showFeedback(this.clue3Feedback, feedback, "error");
        }
    }

    showClue3Success() {
        this.clue3Card.classList.add('solved');
        this.clue3Feedback.className = 'feedback-box success-feedback visible';
        this.clue3Feedback.innerHTML = `
            <div class="feedback-header">
                <span class="icon">✔</span> CODE ANALYSIS VERIFIED (+200 XP)
            </div>
            <div class="feedback-body">
                <p style="font-size: 1.05rem; margin-bottom: 8px;">
                    <strong style="color: var(--amber-neon);">CRITICAL FINDING:</strong>
                    <span class="highlight-cyan" style="font-size: 1.15rem;">"Marcus's credentials match the access code."</span>
                </p>
                <div style="background: rgba(255, 51, 102, 0.1); border-left: 3px solid var(--red-neon); padding: 10px 14px; border-radius: 0 4px 4px 0; margin-bottom: 12px; font-size: 0.92rem; color: #ffccd5;">
                    <strong>IMPORTANT INVESTIGATIVE NOTICE:</strong> Matching the code makes Marcus a primary suspect, but it does <strong>NOT</strong> prove that he is the mastermind.
                </div>
                <div class="intel-brief">
                    <strong>Intelligence Debrief (Python Data Structures):</strong>
                    <p>• <strong>Dictionaries</strong> store key-value associations (e.g. <code>"Marcus": 42</code>).</p>
                    <p>• <strong>For Loops</strong> traverse collections sequentially item by item.</p>
                    <p>• <strong>If Conditions</strong> execute enclosed blocks only when comparison evaluates to True (<code>code == 42</code>).</p>
                </div>
            </div>
        `;

        if (this.cardBoardPrompt) this.cardBoardPrompt.style.display = 'block';
        if (this.btnOpenEvidenceBoard) this.btnOpenEvidenceBoard.style.display = 'inline-flex';
    }

    showEvidenceCollectedModal() {
        if (this.screens.evidenceCollectedModal) {
            window.soundFX.accessGranted();
            this.screens.evidenceCollectedModal.classList.add('active');
            this.state.evidenceCollectedModalShown = true;
            this.saveState();
        }
    }

    inspectEvidenceDetail(clueNumber) {
        window.soundFX.buttonClick();
        if (clueNumber === 1) {
            this.evidenceDetailTag.textContent = "CLUE 01 // INTERCEPTED DISTRESS PACKET";
            this.evidenceDetailTitle.textContent = "BINARY DISTRESS SIGNAL: HELP";
            this.evidenceDetailContent.innerHTML = `
                <p><strong>File:</strong> <code>message_01.txt</code></p>
                <p><strong>Binary Raw Bytes:</strong> <code>01001000 01000101 01001100 01010000</code></p>
                <p><strong>ASCII Translation:</strong> <code>72 ('H') | 69 ('E') | 76 ('L') | 80 ('P')</code></p>
                <p style="margin-top: 12px;"><strong>Investigative Significance:</strong> This was Agent Alex Morgan's final distress signal sent 72 hours ago before going off the radar. It proves that Alex knew a betrayal was taking place inside the cyber intelligence division.</p>
            `;
        } else if (clueNumber === 2) {
            this.evidenceDetailTag.textContent = "CLUE 02 // PHYSICAL LOCATION DIRECTIVE";
            this.evidenceDetailTitle.textContent = "CAESAR CIPHER: LOOK AT THE DOOR";
            this.evidenceDetailContent.innerHTML = `
                <p><strong>File:</strong> <code>cipher_intercept.dat</code></p>
                <p><strong>Encrypted Ciphertext:</strong> <code>ORRN DW WKH GRRU</code></p>
                <p><strong>Shift Parameter:</strong> 3 steps backwards in the Latin alphabet</p>
                <p><strong>Decoded Instruction:</strong> <span class="highlight-cyan">LOOK AT THE DOOR</span></p>
                <p style="margin-top: 12px;"><strong>Investigative Significance:</strong> Rather than hiding evidence in standard office desks or digital cloud drives, Alex physically stashed critical intelligence behind the agency facility's heavy security door.</p>
            `;
        } else if (clueNumber === 3) {
            this.evidenceDetailTag.textContent = "CLUE 03 // PYTHON CREDENTIAL VERIFICATION";
            this.evidenceDetailTitle.textContent = "AUDIT SCRIPT: MARCUS & PASSKEY 42";
            this.evidenceDetailContent.innerHTML = `
                <p><strong>File:</strong> <code>verify_suspects.py</code></p>
                <p><strong>Script Target:</strong> <code>secret_code = 42</code></p>
                <p><strong>Suspects Evaluated:</strong> Daniel (15), Sarah (27), Marcus (42)</p>
                <p><strong>Output:</strong> <code>Suspect found: Marcus</code></p>
                <p style="margin-top: 12px;"><strong>Investigative Significance:</strong> Marcus's credentials match access passkey 42. He had root privilege access to the sector. While this makes Marcus a primary suspect, it does not confirm whether he acted alone or under coercion.</p>
            `;
        }
        this.screens.evidenceDetailModal.classList.add('active');
    }

    validateFinalInvestigation() {
        const suspect = document.querySelector('input[name="final-suspect"]:checked')?.value;
        const location = document.querySelector('input[name="final-location"]:checked')?.value;
        const code = this.finalInputCode.value.trim();
        const reasoning = this.finalReasoningText.value.trim();

        if (!suspect || !location || !code) {
            window.soundFX.accessDenied();
            this.showFeedback(this.finalFeedback, "INCOMPLETE DOSSIER: Please select your suspect, location, and enter the secret code.", "warning");
            return;
        }

        const isSuspectCorrect = suspect === 'Marcus';
        const isLocationCorrect = location === 'The Door';
        const isCodeCorrect = code === '42';

        const reasonLower = reasoning.toLowerCase();
        const mentionsMarcus = reasonLower.includes('marcus') || reasonLower.includes('network');
        const mentionsCode = reasonLower.includes('42') || reasonLower.includes('code') || reasonLower.includes('credential') || reasonLower.includes('pass') || reasonLower.includes('match') || reasonLower.includes('access') || reasonLower.includes('python') || reasonLower.includes('script') || reasonLower.includes('loop');
        const hasSubstance = reasoning.length >= 10;
        const isReasoningValid = hasSubstance && (mentionsMarcus || mentionsCode);

        if (isSuspectCorrect && isLocationCorrect && isCodeCorrect && isReasoningValid) {
            window.soundFX.accessGranted();
            this.state.finalReportAccepted = true;
            this.saveState();

            this.finalFeedback.className = 'feedback-box visible success-feedback';
            this.finalFeedback.innerHTML = `<span class="icon">✔</span> REPORT VERIFIED // CREDENTIALS & LOCATION CONFIRMED`;
            this.bannerReportAccepted.classList.add('visible');
            this.btnSubmitFinal.disabled = true;

            this.showFlashNotification("INVESTIGATION REPORT ACCEPTED: Proceeding to secure facility door...", "success");

            setTimeout(() => {
                this.showScreen('secretRoom');
                this.startDoorUnlockSequence();
            }, 1400);
        } else {
            window.soundFX.accessDenied();
            let hintMsg = "VERIFICATION REJECTED: ";
            if (!isSuspectCorrect) hintMsg += "The suspect identity does not match the recovered Python script output. ";
            if (!isLocationCorrect) hintMsg += "The location does not align with the Caesar Cipher decoded directive. ";
            if (!isCodeCorrect) hintMsg += "The access passkey is invalid (check the secret_code variable in Clue 3). ";
            if (!isReasoningValid) hintMsg += "In Question 4, briefly explain why you suspect Marcus and reference the matching access code. ";
            this.showFeedback(this.finalFeedback, hintMsg, "error");
        }
    }

    startDoorUnlockSequence() {
        if (!this.secretKeypadScreen) return;

        this.secretKeypadScreen.textContent = "- -";
        this.secretKeypadScreen.classList.remove('granted');
        this.secretBoltBar.style.width = '0%';
        this.secretBlastDoors.classList.remove('blast-door-open');
        this.secretChamberContent.style.display = 'none';

        setTimeout(() => {
            window.soundFX.keypadBeep(4);
            this.secretKeypadScreen.textContent = "4 -";
        }, 400);

        setTimeout(() => {
            window.soundFX.keypadBeep(2);
            this.secretKeypadScreen.textContent = "4 2";
        }, 900);

        setTimeout(() => {
            window.soundFX.keypadBeep(5);
            this.secretKeypadScreen.textContent = "GRANTED";
            this.secretKeypadScreen.classList.add('granted');
            this.secretBoltBar.style.width = '100%';
        }, 1400);

        setTimeout(() => {
            window.soundFX.doorUnlock();
            this.secretBlastDoors.classList.add('blast-door-open');
        }, 1900);

        setTimeout(() => {
            this.secretChamberContent.style.display = 'block';
            this.state.secretRoomUnlocked = true;
            this.saveState();
            this.playAlexRecording();
        }, 2700);
    }

    playAlexRecording() {
        if (!this.audioTypewriterText) return;

        const transcript = `Agent, if you're hearing this, you've found the right location.\n\nThe evidence was deliberately left behind. Marcus had access to the system, but he wasn't working alone.\n\nSomeone much higher inside the agency is controlling Shadow Protocol.\n\nI don't know who to trust anymore.\n\nFind the truth. Don't let them silence you.`;

        const bars = this.audioVisualizerBars.querySelectorAll('.wave-bar');
        bars.forEach(b => b.classList.add('playing'));
        window.soundFX.transmissionStatic();

        this.audioTypewriterText.innerHTML = '';
        let idx = 0;
        if (this.audioTypewriterTimeout) clearTimeout(this.audioTypewriterTimeout);

        const typeAudio = () => {
            if (idx < transcript.length) {
                const char = transcript.charAt(idx);
                if (char === '\n') {
                    this.audioTypewriterText.innerHTML += '<br>';
                } else {
                    this.audioTypewriterText.innerHTML += char;
                }
                idx++;
                if (idx % 6 === 0) window.soundFX.keyClick();
                this.audioTypewriterTimeout = setTimeout(typeAudio, 22);
            } else {
                bars.forEach(b => b.classList.remove('playing'));
                this.state.recordingPlayed = true;
                this.saveState();
            }
        };

        typeAudio();
    }

    showDebriefingModal() {
        this.screens.debriefingModal.classList.add('active');
        window.soundFX.missionComplete();

        if (!this.state.level1Completed) {
            this.addXP(500);
            this.state.level1Completed = true;
            this.state.stats.completedTime = Date.now();
            this.saveState();
            this.markLevel1CompleteUI();
        }

        const statXP = document.getElementById('stat-xp');
        if (statXP) statXP.textContent = `${this.state.xp} XP`;
    }

    markLevel1CompleteUI() {
        if (!this.btnStartLvl1) return;
        this.btnStartLvl1.innerHTML = `<span class="icon">★</span> REPLAY MISSION (COMPLETED)`;
        this.btnStartLvl1.classList.add('btn-completed');
        const badge = document.getElementById('lvl1-badge');
        if (badge) {
            badge.textContent = 'COMPLETED';
            badge.className = 'status-tag status-completed';
        }
    }

    showFeedback(container, message, type = 'error') {
        if (!container) return;
        container.className = `feedback-box ${type}-feedback visible`;
        container.innerHTML = `<span class="icon">${type === 'error' ? '✖' : '⚠'}</span> ${message}`;
    }

    showFlashNotification(message, type = 'info') {
        const notif = document.getElementById('global-notification');
        if (!notif) return;
        notif.className = `notification-toast toast-${type} active`;
        notif.textContent = message;
        setTimeout(() => {
            notif.classList.remove('active');
        }, 4000);
    }

    openHintModal() {
        const content = document.getElementById('hint-modal-content');
        this.state.stats.hintsUsed++;
        this.saveState();

        let clueHint = '';
        if (!this.state.clue1.solved) {
            clueHint = `
                <h4>CLUE 01 – BINARY ANALYSIS HINT:</h4>
                <p>Computers represent text using 8-bit binary numbers. Translate each byte into its ASCII character:</p>
                <ul>
                    <li><code>01001000</code> = 72 = <strong>'H'</strong></li>
                    <li><code>01000101</code> = 69 = <strong>'E'</strong></li>
                    <li><code>01001100</code> = 76 = <strong>'L'</strong></li>
                    <li><code>01010000</code> = 80 = <strong>'P'</strong></li>
                </ul>
            `;
        } else if (!this.state.clue2.solved) {
            clueHint = `
                <h4>CLUE 02 – CAESAR CIPHER HINT:</h4>
                <p>Move each letter 3 positions backward in the alphabet:</p>
                <p><code>O → L</code>, <code>R → O</code>, <code>R → O</code>, <code>N → K</code> ...</p>
                <p>It forms an instruction pointing to a physical location: <em>"LOOK AT THE DOOR"</em>.</p>
            `;
        } else if (!this.state.clue3.solved) {
            clueHint = `
                <h4>CLUE 03 – PYTHON CODE HINT:</h4>
                <p>Click <strong>EXECUTE SCRIPT</strong> to observe the terminal runtime output.</p>
                <p>The loop checks <code>code == secret_code (42)</code>. Marcus has value 42, which matches the condition.</p>
            `;
        } else {
            clueHint = `
                <h4>FINAL INVESTIGATION & EVIDENCE BOARD HINT:</h4>
                <p>Connect the findings:</p>
                <ul>
                    <li><strong>Suspect:</strong> Marcus (access code 42 verified).</li>
                    <li><strong>Location:</strong> The Door (Alex hid the evidence behind the secure door).</li>
                    <li><strong>Access Code:</strong> 42 (matches Marcus's credentials).</li>
                    <li><strong>Reasoning:</strong> Marcus is a primary suspect due to his access code matching the system check.</li>
                </ul>
            `;
        }

        content.innerHTML = clueHint;
        this.screens.hintModal.classList.add('active');
    }

    addXP(points) {
        this.state.xp += points;
        this.saveState();
        this.showFlashNotification(`+${points} XP GRANTED // CLEARANCE ELEVATED`, 'success');
    }

    addEvidence(title, details) {
        const exists = this.state.evidenceNotebook.some(e => e.title === title);
        if (!exists) {
            this.state.evidenceNotebook.push({
                title,
                details,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            this.saveState();
            this.renderEvidence();
        }
    }

    renderEvidence() {
        if (!this.evidenceList) return;
        if (this.state.evidenceNotebook.length === 0) {
            this.evidenceList.innerHTML = `<li class="empty-log">Awaiting recovered evidence...</li>`;
            return;
        }

        this.evidenceList.innerHTML = this.state.evidenceNotebook.map(e => `
            <li class="evidence-item">
                <div class="evidence-meta">
                    <span class="evidence-tag">CONFIDENTIAL</span>
                    <span class="evidence-time">${e.timestamp}</span>
                </div>
                <h5 class="evidence-title">${e.title}</h5>
                <p class="evidence-text">${e.details}</p>
            </li>
        `).join('');
    }

    updateHUD() {
        this.hudXP.forEach(el => el.textContent = this.state.xp);
        let rank = "RECRUIT INVESTIGATOR";
        if (this.state.xp >= 950) rank = "SPECIAL FIELD AGENT (ELITE)";
        else if (this.state.xp >= 450) rank = "SENIOR CYBER ANALYST";
        else if (this.state.xp >= 250) rank = "SECURITY OPERATIVE";

        this.hudRank.forEach(el => el.textContent = rank);

        let solvedCount = 0;
        if (this.state.clue1.solved) solvedCount++;
        if (this.state.clue2.solved) solvedCount++;
        if (this.state.clue3.solved) solvedCount++;

        if (this.hudProgressText) {
            this.hudProgressText.textContent = `${solvedCount}/3 CLUES`;
        }
        if (this.hudProgressBar) {
            const percent = (solvedCount / 3) * 100;
            this.hudProgressBar.style.width = `${percent}%`;
        }

        this.renderEvidence();
    }

    restoreGameProgressUI() {
        if (this.state.clue1.solved) {
            this.clue1Input.value = 'HELP';
            this.showClue1Success();
            this.unlockClue2();
        }
        if (this.state.clue2.solved) {
            this.clue2Input.value = 'LOOK AT THE DOOR';
            this.showClue2Success();
            this.unlockClue3();
        }
        if (this.state.clue3.solved) {
            const q1 = document.querySelector('input[name="q1"][value="dictionary-map"]');
            if (q1) q1.checked = true;
            const q2 = document.querySelector('input[name="q2"][value="loop-pairs"]');
            if (q2) q2.checked = true;
            const q3 = document.querySelector('input[name="q3"][value="marcus"]');
            if (q3) q3.checked = true;
            this.showClue3Success();
        }
        if (this.state.finalReportAccepted) {
            const sus = document.querySelector('input[name="final-suspect"][value="Marcus"]');
            if (sus) sus.checked = true;
            const loc = document.querySelector('input[name="final-location"][value="The Door"]');
            if (loc) loc.checked = true;
            if (this.finalInputCode) this.finalInputCode.value = '42';
            if (this.finalReasoningText) this.finalReasoningText.value = 'Marcus credentials match code 42';
            if (this.bannerReportAccepted) this.bannerReportAccepted.classList.add('visible');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.spyGame = new SpyGame();
});
