# ssf-inventory

## How to Clone the Repository

Follow these steps to set up the `ssf-inventory` project on your local device.

### 1. Create a Folder

Create a new folder where you want to store the project.

Example:

```text
D:\DSAC\Others\ssf-inventory
```

### 2. Open the Folder in Terminal

Right-click inside the folder and select:

**Open in Terminal**

### 3. Initialize Git

Run:

```bash
git init
```

### 4. Add the Remote Repository

Connect the local folder to the GitHub repository:

```bash
git remote add origin https://github.com/fsuudsac/ssf-inventory.git
```

### 5. Fetch the Repository

Download the available branches and commits from the remote repository:

```bash
git fetch
```

### 6. Checkout the Required Branch

Switch to the `20260827_uallau_update` branch:

```bash
git checkout -b 20260827_uallau_update
```

> **Note:** Depending on your Git version and configuration, standard `git checkout` may not automatically pull the files if the branch exists only on the remote. Using `git checkout -b <branch> origin/<branch>` ensures the local tracking branch is properly created and checked out with all project files.

---

## Project Installation

After checking out the branch, install the project dependencies in your project folder.

### 7. Install PHP Dependencies

Run:

```bash
composer install
```

This installs the PHP dependencies required by the Laravel application.

### 8. Install Node.js Dependencies

Run:

```bash
npm install
```

This installs the JavaScript dependencies required by the frontend.

---

## Quick Setup

Run all setup commands in sequence:

```bash
git init
git remote add origin https://github.com/fsuudsac/ssf-inventory.git
git fetch
git checkout -b 20260827_uallau_update origin/20260827_uallau_update
composer install
npm install
```
