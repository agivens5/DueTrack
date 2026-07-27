"use strict";

const AUTH_API_BASE = "/api/auth";

const Auth = {
    async request(endpoint, options = {}) {
        const requestOptions = {
            method: options.method || "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        };

        if (options.body !== undefined) {
            requestOptions.body = JSON.stringify(options.body);
        }

        let response;

        try {
            response = await fetch(
                `${AUTH_API_BASE}${endpoint}`,
                requestOptions
            );
        } catch (error) {
            throw new Error(
                "Unable to connect to the DueTrack server. Make sure the server is running."
            );
        }

        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        if (!response.ok) {
            const errorMessage =
                data.message ||
                data.error ||
                "Something went wrong. Please try again.";

            const requestError = new Error(errorMessage);
            requestError.status = response.status;
            requestError.data = data;

            throw requestError;
        }

        return data;
    },

    async register(userData) {
        return this.request("/register", {
            method: "POST",
            body: userData
        });
    },

    async login(credentials) {
        return this.request("/login", {
            method: "POST",
            body: credentials
        });
    },

    async logout() {
        return this.request("/logout", {
            method: "POST"
        });
    },

    async getCurrentUser() {
        return this.request("/me");
    },

    async redirectAuthenticatedUser() {
        try {
            await this.getCurrentUser();
            window.location.replace("index.html");
            return true;
        } catch (error) {
            if (error.status !== 401) {
                console.error(
                    "Unable to check the current authentication session:",
                    error
                );
            }

            return false;
        }
    },

    async requireAuthentication() {
        try {
            const response = await this.getCurrentUser();

            const user =
                response.user ||
                response;

            return user;
        } catch (error) {
            if (error.status === 401) {
                window.location.replace("login.html");
                return null;
            }

            throw error;
        }
    },

    async handleLogout() {
        try {
            await this.logout();
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            window.location.replace("login.html");
        }
    },

    normalizeEmail(email) {
        return String(email || "")
            .trim()
            .toLowerCase();
    },

    isValidEmail(email) {
        const normalizedEmail = this.normalizeEmail(email);

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(normalizedEmail);
    },

    validateName(name) {
        const normalizedName = String(name || "").trim();

        if (!normalizedName) {
            return {
                valid: false,
                message: "This field is required."
            };
        }

        if (normalizedName.length < 2) {
            return {
                valid: false,
                message: "Please enter at least 2 characters."
            };
        }

        if (normalizedName.length > 50) {
            return {
                valid: false,
                message: "Please enter 50 characters or fewer."
            };
        }

        return {
            valid: true,
            message: ""
        };
    },

    getPasswordRequirements(password) {
        const value = String(password || "");

        return {
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            number: /\d/.test(value)
        };
    },

    isValidPassword(password) {
        const requirements =
            this.getPasswordRequirements(password);

        return Object.values(requirements).every(Boolean);
    },

    getPasswordStrength(password) {
        const value = String(password || "");

        if (!value) {
            return {
                score: 0,
                label: "Not entered",
                className: ""
            };
        }

        let score = 0;

        if (value.length >= 8) {
            score += 1;
        }

        if (/[A-Z]/.test(value)) {
            score += 1;
        }

        if (/[a-z]/.test(value)) {
            score += 1;
        }

        if (/\d/.test(value)) {
            score += 1;
        }

        if (/[^A-Za-z0-9]/.test(value)) {
            score += 1;
        }

        if (value.length >= 12) {
            score += 1;
        }

        if (score <= 2) {
            return {
                score,
                label: "Weak",
                className: "strength-weak"
            };
        }

        if (score === 3) {
            return {
                score,
                label: "Fair",
                className: "strength-fair"
            };
        }

        if (score === 4) {
            return {
                score,
                label: "Good",
                className: "strength-good"
            };
        }

        return {
            score,
            label: "Strong",
            className: "strength-strong"
        };
    },

    setFieldError(inputElement, errorElement, message) {
        if (!inputElement || !errorElement) {
            return;
        }

        const field =
            inputElement.closest(".auth-field");

        errorElement.textContent = message || "";

        if (message) {
            inputElement.setAttribute("aria-invalid", "true");

            if (field) {
                field.classList.add("has-error");
            }
        } else {
            inputElement.removeAttribute("aria-invalid");

            if (field) {
                field.classList.remove("has-error");
            }
        }
    },

    clearFieldError(inputElement, errorElement) {
        this.setFieldError(
            inputElement,
            errorElement,
            ""
        );
    },

    clearMessage(messageElement) {
        if (!messageElement) {
            return;
        }

        messageElement.textContent = "";
        messageElement.classList.remove(
            "success",
            "error"
        );
    },

    showMessage(messageElement, message, type = "error") {
        if (!messageElement) {
            return;
        }

        messageElement.textContent = message;
        messageElement.classList.remove(
            "success",
            "error"
        );

        messageElement.classList.add(type);
    },

    setButtonLoading(button, isLoading) {
        if (!button) {
            return;
        }

        const label =
            button.querySelector(".button-label");

        const spinner =
            button.querySelector(".button-spinner");

        button.disabled = isLoading;
        button.setAttribute(
            "aria-busy",
            String(isLoading)
        );

        if (label) {
            label.classList.toggle(
                "hidden",
                isLoading
            );
        }

        if (spinner) {
            spinner.classList.toggle(
                "hidden",
                !isLoading
            );
        }
    },

    setupPasswordToggle(button, input) {
        if (!button || !input) {
            return;
        }

        button.addEventListener("click", () => {
            const passwordIsVisible =
                input.type === "text";

            input.type =
                passwordIsVisible
                    ? "password"
                    : "text";

            button.textContent =
                passwordIsVisible
                    ? "Show"
                    : "Hide";

            button.setAttribute(
                "aria-label",
                passwordIsVisible
                    ? "Show password"
                    : "Hide password"
            );

            button.setAttribute(
                "aria-pressed",
                String(!passwordIsVisible)
            );

            input.focus();
        });
    },

    saveRememberedEmail(email, shouldRemember) {
        const storageKey = "duetrackRememberedEmail";

        if (shouldRemember) {
            localStorage.setItem(
                storageKey,
                this.normalizeEmail(email)
            );
        } else {
            localStorage.removeItem(storageKey);
        }
    },

    getRememberedEmail() {
        return localStorage.getItem(
            "duetrackRememberedEmail"
        ) || "";
    },

    getUserDisplayName(user) {
        if (!user) {
            return "DueTrack User";
        }

        const firstName =
            user.first_name ||
            user.firstName ||
            "";

        const lastName =
            user.last_name ||
            user.lastName ||
            "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return (
            fullName ||
            user.name ||
            user.email ||
            "DueTrack User"
        );
    }
};

window.Auth = Auth;