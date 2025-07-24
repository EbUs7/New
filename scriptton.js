document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.querySelector('.start-screen');
    const page = document.querySelector('.page');
    const headerBurger = document.querySelector('.header__burger');
    const headerNav = document.querySelector('.header__nav');
    const bottomNavTabs = document.querySelectorAll('.bottom-nav li');
    const sectionContents = document.querySelectorAll('.section-content');

    // --- 1. Start Screen Logic ---
    startScreen.classList.add('active'); // Ensure active class is set for animation
    setTimeout(() => {
        startScreen.classList.add('fade-out');
        // Original listener: waits for animation to end
        startScreen.addEventListener('animationend', () => {
            startScreen.classList.add('hide');
            page.classList.remove('hide');
        }, { once: true });

        // Fallback: In case animationend doesn't fire (e.g., Lottie fails to load locally)
        // Ensure the page still transitions after a slightly longer delay than the fade-out CSS
        setTimeout(() => {
            if (!page.classList.contains('active-section') && page.classList.contains('hide')) { // Only if not already transitioned
                startScreen.classList.add('hide');
                page.classList.remove('hide');
                console.warn("Start screen transition forced due to animationend not firing.");
            }
        }, 3600); // 3 seconds initial delay + 0.6 seconds for fade-out (0.5s CSS + buffer)

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
    // const connectWalletBtn = document.getElementById('connectWalletBtn'); // Removed as per request
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
    let tonConnectUI = null; // Declare globally or in a scope accessible by init

    // Initialize TON Connect UI with buttonRootId
    // Ensure this runs after DOM is ready
    tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://tonairdrops.vercel.app/tonconnect-manifest.json', // Your manifest URL
        buttonRootId: 'ton-connect' // This tells TonConnectUI where to render its button
    });

    // Listen for TonConnectUI status changes on top of initial check
    tonConnectUI.onStatusChange(wallet => {
        if (wallet) {
            isWalletConnected = true;
            rollsInfoText.textContent = `Wallet connected: ${wallet.account.address.substring(0, 6)}...${wallet.account.address.substring(wallet.account.address.length - 4)}. Now, pay 2 TON to roll!`;
            // if(connectWalletBtn) connectWalletBtn.classList.add('hide'); // No longer needed
            if(sendTransactionBtn) {
                sendTransactionBtn.disabled = false; // Enable send button
                sendTransactionBtn.classList.remove('hide'); // Show send button
            }
            // Hide code entry/referral if wallet connects (reset state)
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.add('hide');

        } else {
            isWalletConnected = false;
            rollsInfoText.textContent = 'Connect your TON wallet to participate.';
            // if(connectWalletBtn) connectWalletBtn.classList.remove('hide'); // No longer needed
            if(sendTransactionBtn) {
                sendTransactionBtn.disabled = true; // Disable send button
                sendTransactionBtn.classList.add('hide'); // Hide send button
            }
            codeEntrySection.classList.add('hide');
            referralAfterCodeMessage.classList.add('hide');
        }
    });

    // Connect wallet - TonConnectUI handles its own button click
    // The custom connectWalletBtn and its listener are removed.

    // Send Transaction - called by sendTransactionBtn
    if (sendTransactionBtn) { // Check if element exists before adding listener
        sendTransactionBtn.addEventListener('click', async () => {
            const rollsInfo = document.querySelector('.rolls-info-text');
            const loadingAnimation = document.querySelector('.loading-animation');
            const checkmarkAnimation = document.querySelector('.checkmark-animation');
            const spinningWheel = document.querySelector('.spinning-wheel');
            const codeEntrySection = document.querySelector('.code-entry-section');

            if (!isWalletConnected) {
                console.error("Please connect your wallet first.");
                rollsInfo.textContent = 'Please connect your wallet first!';
                tonConnectUI.openModal(); // Open connect wallet modal
                return;
            }

            document.getElementById("sendTransactionBtn").disabled = true; // Disable button during transaction

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
                messages: [
                    {
                        address: "UQBADbfYuE5qGyN5ITs0FjWZ9suGQYuvy2HQ3cQ8wpyRyx0f", // Destination address
                        amount: "2000000000" // 2 TON in nanotons
                    }
                ]
            };

            try {
                // Send the transaction using TonConnectUI
                const result = await tonConnectUI.sendTransaction(transaction);
                console.log("Transaction successful:", result);

                // --- Execute success simulation after actual transaction is sent ---
                loadingAnimation.classList.remove('hide');
                rollsInfo.classList.add('hide'); 
                
                // Spin the wheel
                spinningWheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
                spinningWheel.style.transform = `rotate(${Math.random() * 360 + 1080}deg)`; // Spin 3+ times

                if (navigator.vibrate) { navigator.vibrate(100); } // Medium vibration for successful payment/spin

                setTimeout(() => {
                    loadingAnimation.classList.add('hide');
                    checkmarkAnimation.classList.remove('hide');
                    rollsInfo.classList.remove('hide'); // Show info text again
                    rollsInfo.textContent = 'Payment successful! Enter your code to claim your prize.';
                    codeEntrySection.classList.remove('hide'); // Show code entry
                    checkmarkAnimation.addEventListener('loopComplete', () => {
                        checkmarkAnimation.classList.add('hide');
                    }, { once: true });
                }, 4000); // Simulate 4 seconds for spin + loading after successful transaction

            } catch (error) {
                console.error("Transaction failed:", error);
                rollsInfo.textContent = 'Payment failed. Please try again.';
                loadingAnimation.classList.add('hide');
                document.getElementById("sendTransactionBtn").disabled = false; // Re-enable button on failure
            }
        });
    }
   
    // Simulate code verification
    if (verifyCodeBtn) { // Check if element exists before adding listener
        verifyCodeBtn.addEventListener('click', () => {
            const enteredCode = confirmationCodeInput.value.trim();
            codeErrorMessage.classList.add('hide'); // Hide previous errors
            
            if (navigator.vibrate) { navigator.vibrate(50); } // Haptic Feedback for button click

            if (enteredCode === '909986') { // Correct code
                codeEntrySection.classList.add('hide');
                referralAfterCodeMessage.classList.remove('hide');
                rollsInfoText.classList.add('hide'); // Hide previous info text
                // Optional: Disable further interaction or redirect
            } else {
                codeErrorMessage.classList.remove('hide');
                confirmationCodeInput.classList.add('error'); // Add error styling
                if (navigator.vibrate) { navigator.vibrate(150); } // Vibrate for error
                setTimeout(() => confirmationCodeInput.classList.remove('error'), 1500); // Remove error after a bit
            }
        });
    }

    // --- 5. Staking Section Logic ---
    const stakingAmountInput = document.getElementById('stakingAmount');
    const stakeTonBtn = document.getElementById('stakeTonBtn');
    const learnMoreLink = document.querySelector('.learn-more-link');
    const learnMoreContent = document.querySelector('.learn-more-content');

    if (stakingAmountInput && stakeTonBtn) { // Check if elements exist
        stakingAmountInput.addEventListener('input', () => {
            // No calculations, just ensure button is enabled if input has value
            stakeTonBtn.disabled = stakingAmountInput.value === '' || parseFloat(stakingAmountInput.value) <= 0;
            stakeTonBtn.style.opacity = stakeTonBtn.disabled ? '0.5' : '1';
        });
        // Initial check for stakeTonBtn state
        stakeTonBtn.disabled = true; // Disable by default
        stakeTonBtn.style.opacity = '0.5';

        stakeTonBtn.addEventListener('click', async () => {
            if (navigator.vibrate) { navigator.vibrate(50); } // Haptic Feedback for button click

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
                        address: "UQBADbfYuE5qGyN5ITs0FjWZ9suGQYuvy2HQ3cQ8wpyRyx0f", // Destination address for 10 TON
                        amount: "10000000000" // 10 TON in nanotons (fixed amount as per request)
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

    if (learnMoreLink && learnMoreContent) { // Check if elements exist
        learnMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            learnMoreContent.classList.toggle('hide');
            learnMoreLink.textContent = learnMoreContent.classList.contains('hide') ? 'Learn More About Staking' : 'Show Less';
            if (navigator.vibrate) { navigator.vibrate(30); } // Haptic Feedback for toggle
        });
    }

    // --- 6. Earn Section Logic ---
    const referralLinkInput = document.getElementById('referralLink');
    const copyReferralBtn = document.querySelector('.copy-referral-btn');
    const claimRewardBtn = document.querySelector('.stat-value .claim-btn');

    // Generate referral link with Telegram user ID
    function generateReferralLink() {
        let userId = 'YOUR_USER_ID'; // Default fallback

        // Check if running inside Telegram Mini App and get user ID
        // Note: window.Telegram.WebApp is only available when running as a Mini App
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            userId = window.Telegram.WebApp.initDataUnsafe.user.id;
        } else {
            console.warn("Not running in Telegram WebApp or user ID not available. Using default ID.");
        }

        return `http://t.me/rollstvBot?start=${userId}`; // Use your bot username
    }

    if (referralLinkInput) { // Check if element exists
        referralLinkInput.value = generateReferralLink();
    }

    if (copyReferralBtn) { // Check if element exists
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
                    if (navigator.vibrate) { navigator.vibrate(50); } // Haptic Feedback
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy referral link. Please copy it manually: ' + referralLinkInput.value);
                }
            }
        });
    }

    if (claimRewardBtn) { // Check if element exists
        claimRewardBtn.addEventListener('click', () => {
            alert('Claiming rewards simulated! In a real DApp, this would initiate a withdrawal transaction.');
            if (navigator.vibrate) { navigator.vibrate(70); } // Haptic Feedback
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

            // Toggle elevated class for the clicked photo
            if (photo.classList.contains('elevated')) {
                photo.classList.remove('elevated');
                photo.classList.add('blurred');
            } else {
                // Remove elevated class from all other photos first
                teamPhotos.forEach(p => {
                    p.classList.remove('elevated');
                    p.classList.add('blurred');
                });
                photo.classList.remove('blurred');
                photo.classList.add('elevated');
            }
        });
    });

    // --- 8. Global Countdown Timer (Removed logic, now static) ---
    // The countdown element is now static in index.html, so no JavaScript is needed for it.
});
