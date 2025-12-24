<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
    // return response()->json(['message' => 'Laravel API is running']);
})->name('home');
