# Contributing to CEMS

The Campus Exit Management System (CEMS) is a collaborative project designed to streamline student exit requests at Babcock University. We value your code, bug reports, and feature requests.

## 🛠️ Tech Stack

Before contributing, please ensure you are familiar with the core technologies used in this project:

* **Frontend:** React + TypeScript + Vite
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn UI
* **Backend/Database:** Supabase
* **Icons:** Lucide React

## 👩‍💻 Development Workflow

We follow the **Feature Branch Workflow**. Please do not push changes directly to the `main` branch.

### 1. Fork & Clone
1.  Fork the repository to your own GitHub account.
2.  Clone the project to your local machine:
    ```bash
    git clone (https://github.com/BU-SENG/foss-project-olive.git
    cd foss-project-olive
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### 2. Create a Branch
Create a new branch for your specific task. Use a descriptive name that explains what you are working on:

```bash
git checkout -b feature/add-(feature-you-are-adding)
# Example: git checkout -b feature/add-login-screen
```

### 3. Coding Standards
To keep the codebase clean and maintainable, please follow these rules:

* **Components:** Use functional components with TypeScript interfaces for props.
* **Styling:** Use Tailwind CSS utility classes. Avoid creating custom CSS files unless absolutely necessary.
* **UI Library:** Use the pre-installed Shadcn UI components from `src/components/ui` instead of building scratch components (e.g., use `Button` instead of `<button>`).
* **Clean Code:** Remove `console.log` statements and unused imports before committing.
* **No Any:** Avoid using the `any` type in TypeScript whenever possible.

### 4. Commit Messages
Write clear, concise commit messages in the present tense.

* ✅ `Add date filter to Hall Admin dashboard`
* ✅ `Fix responsive layout on mobile`
* ❌ `Fixed stuff`
* ❌ `Update code`

### 5. Push & Pull Request
1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-branch-name
   ```
2. Go to the [Main Repository](https://github.com/BU-SENG/foss-project-olive).
3. Click **"Compare & pull request"**.
4. Fill out the PR description describing your changes.
5. Request a review from a team member.

---

## 🐛 Reporting Bugs

If you find a bug, please open an Issue and include:

* A description of the bug.
* Steps to reproduce it.
* Expected vs. actual behavior.
* Screenshots (if visual).

## 💡 Feature Requests

Have an idea? Open an Issue with the tag `enhancement` and describe:

* The problem you are trying to solve.
* Your proposed solution.

Thank you for contributing to CEMS! 🚀
