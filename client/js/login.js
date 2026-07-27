"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const alreadyAuthenticated =
        await Auth.redirectAuthenticatedUser();

    if (alreadyAuthenticated) {
        return;
    }

    const loginForm =
        document.getElementById("login-form");

    const emailInput =
        document.getElementById("login-email");

    const passwordInput =
        document.getElementById("login-password");

    const rememberEmailInput =
        document.getElementById("remember-email");

    const emailError =
        document.getElementById("login-email-error");

    const passwordError =
        document.getElementById("login-password-error");

    const loginMessage =
        document.getElementById("login-message");

    const submitButton =
        document.getElementById("login-submit-button");

    const passwordToggle =
        document.getElementById("toggle-login-password");

    Auth.setupPasswordToggle(
        passwordToggle,
        passwordInput
    );

    loadRememberedEmail();

    emailInput.addEventListener("input", () => {
        Auth.clearFieldError(
            emailInput,
            emailError
        );

        Auth.clearMessage(loginMessage);
    });

    passwordInput.addEventListener("input", () => {
        Auth.clearFieldError(
            passwordInput,
            passwordError
        );

        Auth.clearMessage(loginMessage);
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        Auth.clearMessage(loginMessage);

        const email =
            Auth.normalizeEmail(emailInput.value);

        const password =
            passwordInput.value;

        const formIsValid =
            validateLoginForm(email, password);

        if (!formIsValid) {
            return;
        }

        Auth.setButtonLoading(
            submitButton,
            true
        );

        try {
            await Auth.login({
                email,
                password
            });

            Auth.saveRememberedEmail(
                email,
                rememberEmailInput.checked
            );

            Auth.showMessage(
                loginMessage,
                "Login successful. Redirecting to your dashboard...",
                "success"
            );

            window.setTimeout(() => {
                window.location.replace("index.html");
            }, 500);
        } catch (error) {
            handleLoginError(error);
        } finally {
            Auth.setButtonLoading(
                submitButton,
                false
            );
        }
    });

    function loadRememberedEmail() {
        const rememberedEmail =
            Auth.getRememberedEmail();

        if (!rememberedEmail) {
            return;
        }

        emailInput.value = rememberedEmail;
        rememberEmailInput.checked = true;
        passwordInput.focus();
    }

    function validateLoginForm(email, password) {
        let isValid = true;

        Auth.clearFieldError(
            emailInput,
            emailError
        );

        Auth.clearFieldError(
            passwordInput,
            passwordError
        );

        if (!email) {
            Auth.setFieldError(
                emailInput,
                emailError,
                "Please enter your email address."
            );

            isValid = false;
        } else if (!Auth.isValidEmail(email)) {
            Auth.setFieldError(
                emailInput,
                emailError,
                "Please enter a valid email address."
            );

            isValid = false;
        }

        if (!password) {
            Auth.setFieldError(
                passwordInput,
                passwordError,
                "Please enter your password."
            );

            isValid = false;
        }

        if (!isValid) {
            focusFirstInvalidField();
        }

        return isValid;
    }

    function focusFirstInvalidField() {
        const firstInvalidField =
            loginForm.querySelector(
                '[aria-invalid="true"]'
            );

        if (firstInvalidField) {
            firstInvalidField.focus();
        }
    }

    function handleLoginError(error) {
        if (error.status === 401) {
            Auth.showMessage(
                loginMessage,
                "The email or password you entered is incorrect.",
                "error"
            );

            passwordInput.value = "";
            passwordInput.focus();

            return;
        }

        if (error.status === 400) {
            Auth.showMessage(
                loginMessage,
                error.message ||
                    "Please check your email and password.",
                "error"
            );

            return;
        }

        Auth.showMessage(
            loginMessage,
            error.message ||
                "Unable to sign in right now. Please try again.",
            "error"
        );
    }
});