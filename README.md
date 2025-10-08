# Pitt-ervention Qualtrics Streaks

This repository contains the React Native application that powers the Pitt-ervention Qualtrics streak tracker. The project lives in the [`qualtrics-streaks/`](qualtrics-streaks/) directory.

## Getting Started

1. Install dependencies:
   ```bash
   cd qualtrics-streaks
   npm install
   ```
2. Launch the development server (Metro):
   ```bash
   npm start
   ```
3. Use the Expo Go app or a simulator to load the project.

## Adding Changes to the Repository

If you have code changes from a previous iteration that you want to bring into this repository:

1. **Create or update files** – copy the updated source files (for example, `App.tsx`) into the same paths inside `qualtrics-streaks/`.
2. **Verify TypeScript passes**:
   ```bash
   npm run typecheck
   ```
3. **Run the app** with Metro to confirm everything behaves as expected.
4. **Commit your work**:
   ```bash
   git add .
   git commit -m "Describe your change"
   ```
5. **Push and open a PR** if you are collaborating via GitHub.

## Scripts

- `npm run typecheck` – runs `tsc --noEmit`
- `npm run start` – starts the Expo development server

## Additional Resources

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/docs/getting-started)
