<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    // 1. Allow mass assignment for these fields
    protected $fillable = [
        'title', 
        'content', 
        'author', 
        'references', 
        'published_at'
    ];

    // 2. Tell Laravel to treat 'references' as an array (JSON)
    protected $casts = [
        'references' => 'array',
        'published_at' => 'datetime'
    ];
}