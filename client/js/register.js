"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const alreadyAuthenticated =
        await Auth.redirectAuthenticatedUser();

    if (alreadyAuthenticated) {
        return;
    }

    const registerForm =
        document.getElementById("register-form");

    const firstNameInput =
        document.getElementById("register-first-name");

    const lastNameInput =
        document.getElementById("register-last-name");

    const emailInput =
        document.getElementById("register-email");

    const passwordInput =
        document.getElementById("register-password");

    const confirmPasswordInput =
        document.getElementById("register-confirm-password");

    const acceptTermsInput =
        document.getElementById("accept-terms");

    const firstNameError =
        document.getElementById("register-first-name-error");

    const lastNameError =
        document.getElementById("register-last-name-error");

    const emailError =
        document.getElementById("register-email-error");

    const passwordError =
        document.getElementById("register-password-error");

    const confirmPasswordError =
        document.getElementById(
            "register-confirm-password-error"
        );

    const termsError =
        document.getElementById("register-terms-error");

    const registerMessage =
        document.getElementById("register-message");

    const submitButton =
        document.getElementById("register-submit-button");

    const passwordToggle =
        document.getElementById(
            "toggle-register-password"
        );

    const confirmPasswordToggle =
        document.getElementById(
            "toggle-confirm-password"
        );

    const strengthLabel =
        document.getElementById(
            "password-strength-label"
        );

    const strengthBar =
        document.getElementById(
            "password-strength-bar"
        );

    const lengthRequirement =
        document.getElementById(
            "password-length-requirement"
        );

    const uppercaseRequirement =
        document.getElementById(
            "password-uppercase-requirement"
        );

    const lowercaseRequirement =
        document.getElementById(
            "password-lowercase-requirement"
        );

    const numberRequirement =
        document.getElementById(
            "password-number-requirement"
        );

    Auth.setupPasswordToggle(
        passwordToggle,
        passwordInput
    );

    Auth.setupPasswordToggle(
        confirmPasswordToggle,
        confirmPasswordInput
    );

    firstNameInput.addEventListener("input", () => {
        Auth.clearFieldError(
            firstNameInput,
            firstNameError
        );

        Auth.clearMessage(registerMessage);
    });

    lastNameInput.addEventListener("input", () => {
        Auth.clearFieldError(
            lastNameInput,
            lastNameError
        );

        Auth.clearMessage(registerMessage);
    });

    emailInput.addEventListener("input", () => {
        Auth.clearFieldError(
            emailInput,
            emailError
        );

        Auth.clearMessage(registerMessage);
    });

    passwordInput.addEventListener("input", () => {
        updatePasswordFeedback();

        Auth.clearFieldError(
            passwordInput,
            passwordError
        );

        Auth.clearMessage(registerMessage);

        /*
         * If the user already entered a confirmation password,
         * check it again whenever the original password changes.
         */
        if (confirmPasswordInput.value) {
            validatePasswordMatch();
        }
    });

    confirmPasswordInput.addEventListener("input", () => {
        Auth.clearMessage(registerMessage);
        validatePasswordMatch();
    });

    confirmPasswordInput.addEventListener("blur", () => {
        validatePasswordMatch();
    });

    acceptTermsInput.addEventListener("change", () => {
        termsError.textContent = "";
        Auth.clearMessage(registerMessage);
    });

    registerForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            Auth.clearMessage(registerMessage);

            const firstName =
                firstNameInput.value.trim();

            const lastName =
                lastNameInput.value.trim();

            const email =
                Auth.normalizeEmail(emailInput.value);

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;

            const acceptedTerms =
                acceptTermsInput.checked;

            const formIsValid =
                validateRegistrationForm({
                    firstName,
                    lastName,
                    email,
                    password,
                    confirmPassword,
                    acceptedTerms
                });

            if (!formIsValid) {
                return;
            }

            Auth.setButtonLoading(
                submitButton,
                true
            );

            try {
                await Auth.register({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password
                });

                Auth.showMessage(
                    registerMessage,
                    "Account created successfully. Redirecting to your dashboard...",
                    "success"
                );

                window.setTimeout(() => {
                    window.location.replace(
                        "index.html"
                    );
                }, 600);
            } catch (error) {
                handleRegistrationError(error);
            } finally {
                Auth.setButtonLoading(
                    submitButton,
                    false
                );
            }
        }
    );

    updatePasswordFeedback();

    function validateRegistrationForm(values) {
        let isValid = true;

        clearAllFieldErrors();

        const firstNameValidation =
            Auth.validateName(values.firstName);

        if (!firstNameValidation.valid) {
            Auth.setFieldError(
                firstNameInput,
                firstNameError,
                firstNameValidation.message
            );

            isValid = false;
        }

        const lastNameValidation =
            Auth.validateName(values.lastName);

        if (!lastNameValidation.valid) {
            Auth.setFieldError(
                lastNameInput,
                lastNameError,
                lastNameValidation.message
            );

            isValid = false;
        }

        if (!values.email) {
            Auth.setFieldError(
                emailInput,
                emailError,
                "Please enter your email address."
            );

            isValid = false;
        } else if (!Auth.isValidEmail(values.email)) {
            Auth.setFieldError(
                emailInput,
                emailError,
                "Please enter a valid email address."
            );

            isValid = false;
        }

        if (!values.password) {
            Auth.setFieldError(
                passwordInput,
                passwordError,
                "Please create a password."
            );

            isValid = false;
        } else if (
            !Auth.isValidPassword(values.password)
        ) {
            Auth.setFieldError(
                passwordInput,
                passwordError,
                "Your password must meet all four requirements."
            );

            isValid = false;
        }

        if (!values.confirmPassword) {
            Auth.setFieldError(
                confirmPasswordInput,
                confirmPasswordError,
                "Please confirm your password."
            );

            isValid = false;
        } else if (
            values.confirmPassword !== values.password
        ) {
            Auth.setFieldError(
                confirmPasswordInput,
                confirmPasswordError,
                "The passwords do not match."
            );

            isValid = false;
        }

        if (!values.acceptedTerms) {
            termsError.textContent =
                "You must acknowledge this before creating your account.";

            isValid = false;
        }

        if (!isValid) {
            focusFirstInvalidField();
        }

        return isValid;
    }

    function validatePasswordMatch() {
        const password =
            passwordInput.value;

        const confirmation =
            confirmPasswordInput.value;

        if (!confirmation) {
            Auth.clearFieldError(
                confirmPasswordInput,
                confirmPasswordError
            );

            return false;
        }

        if (confirmation !== password) {
            Auth.setFieldError(
                confirmPasswordInput,
                confirmPasswordError,
                "The passwords do not match."
            );

            return false;
        }

        Auth.clearFieldError(
            confirmPasswordInput,
            confirmPasswordError
        );

        return true;
    }

    function clearAllFieldErrors() {
        Auth.clearFieldError(
            firstNameInput,
            firstNameError
        );

        Auth.clearFieldError(
            lastNameInput,
            lastNameError
        );

        Auth.clearFieldError(
            emailInput,
            emailError
        );

        Auth.clearFieldError(
            passwordInput,
            passwordError
        );

        Auth.clearFieldError(
            confirmPasswordInput,
            confirmPasswordError
        );

        termsError.textContent = "";
    }

    function focusFirstInvalidField() {
        const firstInvalidField =
            registerForm.querySelector(
                '[aria-invalid="true"]'
            );

        if (firstInvalidField) {
            firstInvalidField.focus();
            return;
        }

        if (!acceptTermsInput.checked) {
            acceptTermsInput.focus();
        }
    }

    function updatePasswordFeedback() {
        const password =
            passwordInput.value;

        const requirements =
            Auth.getPasswordRequirements(password);

        updateRequirement(
            lengthRequirement,
            requirements.length
        );

        updateRequirement(
            uppercaseRequirement,
            requirements.uppercase
        );

        updateRequirement(
            lowercaseRequirement,
            requirements.lowercase
        );

        updateRequirement(
            numberRequirement,
            requirements.number
        );

        const strength =
            Auth.getPasswordStrength(password);

        strengthLabel.textContent =
            strength.label;

        strengthBar.classList.remove(
            "strength-weak",
            "strength-fair",
            "strength-good",
            "strength-strong"
        );

        if (strength.className) {
            strengthBar.classList.add(
                strength.className
            );
        }

        if (!password) {
            strengthBar.style.width = "0%";
        } else {
            strengthBar.style.removeProperty(
                "width"
            );
        }
    }

    function updateRequirement(
        requirementElement,
        requirementIsMet
    ) {
        requirementElement.classList.toggle(
            "met",
            requirementIsMet
        );
    }

    function handleRegistrationError(error) {
        if (error.status === 409) {
            Auth.setFieldError(
                emailInput,
                emailError,
                "An account already exists with this email address."
            );

            Auth.showMessage(
                registerMessage,
                "This email is already registered. Try signing in instead.",
                "error"
            );

            emailInput.focus();
            return;
        }

        if (error.status === 400) {
            Auth.showMessage(
                registerMessage,
                error.message ||
                    "Please review your information and try again.",
                "error"
            );

            return;
        }

        Auth.showMessage(
            registerMessage,
            error.message ||
                "Unable to create your account right now. Please try again.",
            "error"
        );
    }
});