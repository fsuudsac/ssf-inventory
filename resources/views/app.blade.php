<!DOCTYPE html>
<html lang="{{ str_replace("_", "-", app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex">

    <title>{{ env("APP_NAME") }}</title>

    <!-- Favicon -->
    <link rel="icon" href={{ env("APP_LOGO") }} type="image/x-icon" />
    {{-- <link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon" /> --}}

    <!-- Windows Phone -->
    <meta name="msapplication-navbutton-color" content="{{ env("PRIMARY_COLOR") }}" />
    <meta name="description" content="{{ env("APP_DESCRIPTION") }}" />

    <link rel="preconnect" href="/fonts/Montserrat/Montserrat-VariableFont_wght.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/Montserrat/static/Montserrat-Regular.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/Montserrat/static/Montserrat-Bold.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/Montserrat/static/Montserrat-Regular.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/Montserrat/static/Montserrat-Medium.ttf" as="font" type="font/ttf"
        crossorigin />
    <link rel="preconnect" href="/fonts/AnnabelleJFRegular/AnnabelleJFRegular.ttf" as="font" type="font/ttf"
        crossorigin />

    @laravelPWA
    @viteReactRefresh
    @vite(["resources/css/app.css", "resources/sass/app.scss", "resources/js/app.jsx"])

    <script src="https://js.pusher.com/7.2/pusher.min.js"></script>
</head>

<body>

    <div id="root">
        <div class="splash-centered">
            <img width="180" src="/images/logo.png" />
            <div class="splash-loader">
                <div class="splash-inner one"></div>
                <div class="splash-inner two"></div>
                <div class="splash-inner three"></div>
            </div>
        </div>
    </div>

</body>

</html>
