// Supabase Configuration
const SUPABASE_URL = 'https://jghcsxfrpgdaqfkzrasx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_a5fWcqobRBsAOzv79G1WoQ_1OtX7uYI';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase safely
    let supabase = null;
    try {
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (err) {
        console.error('Supabase initialization failed:', err);
    }

    const form = document.getElementById('waitlist-form');
    const emailInput = document.getElementById('email');
    const messageDisplay = document.getElementById('form-message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        if (!supabase) {
            showMessage('Supabase configuration missing.', 'error');
            return;
        }

        // Save to Supabase
        saveToSupabase(email);
    });

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function showMessage(text, type) {
        messageDisplay.textContent = text;
        messageDisplay.className = `form-message ${type}`;

        // Clear message after 5 seconds
        setTimeout(() => {
            messageDisplay.style.opacity = '0';
            setTimeout(() => {
                messageDisplay.textContent = '';
                messageDisplay.className = 'form-message';
                messageDisplay.style.opacity = '';
            }, 300);
        }, 5000);
    }

    async function saveToSupabase(email) {
        // Disable button during submission
        const button = form.querySelector('button');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = 'Joining...';
        button.style.opacity = '0.7';

        try {
            const { error } = await supabase
                .from('waiting list')
                .insert([{ email: email }]);

            if (error) throw error;

            console.log(`Success! Email joined: ${email}`);
            showMessage("You're on the list! We'll be in touch soon.", 'success');
            form.reset();

        } catch (error) {
            console.error('Error saving to Supabase:', error.message);
            if (error.code === '23505') {
                showMessage("This email is already on the list!", 'error');
            } else {
                showMessage("Something went wrong. Please try again.", 'error');
            }
        } finally {
            // Re-enable button
            button.disabled = false;
            button.innerHTML = originalText;
            button.style.opacity = '1';
        }
    }

    // Set dynamic year
    document.getElementById('current-year').textContent = new Date().getFullYear();
});
