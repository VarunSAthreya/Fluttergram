# Fluttergram

[![CodeFactor](https://www.codefactor.io/repository/github/varunsathreya/fluttergram/badge)](https://www.codefactor.io/repository/github/varunsathreya/fluttergram)

A Instagram like Social Media Platform built using [Flutter](https://flutter.dev/) and [Firebase](http://firebase.google.com/)

## Getting start:

Make sure you have following installed on your machine:

-   [Flutter SDK](https://flutter.dev/docs/get-started/install)
-   [Android Studio](https://developer.android.com/studio) or [VSCode](https://code.visualstudio.com/download)

To setup Flutter in Android Studio check [here](https://flutter.dev/docs/development/tools/android-studio)

To setup Flutter in VSCode check [here](https://flutter.dev/docs/development/tools/vs-code)

-   Install flutter dependencies using:

```sh
$ flutter pub get
```

-   Setup Firebase(Only Android for now): For more details check [here](https://firebase.google.com/docs/flutter/setup?platform=android)

-   Install firebase tools:

```sh
$ npm install -g firebase-tools
```

-   Install cloud function's dependencies using:

```sh
$ cd functions
$ npm install
$ cd ..
```

Run the app using:

```sh
$ flutter run
```

Upload firebase functions:

```sh
$ firebase deploy --only functions
```
