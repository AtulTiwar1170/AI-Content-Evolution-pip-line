<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller 
{
    /**
     * Display a listing of all articles.
     * Used by Phase 3 (React Dashboard).
     */
    public function index() 
    {
        $articles = Article::orderBy('id', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $articles
        ]);
    }

    /**
     * Store a newly created article.
     * Used by Phase 1 (Node.js Scraper).
     */
    public function store(Request $request) 
    {
        $validator = Validator::make($request->all(), [
            'title'        => 'required|string',
            'content'      => 'required|string',
            'published_at' => 'required',
            'author'       => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $article = Article::create($validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Article created successfully',
            'data' => $article
        ], 201);
    }

    /**
     * Display the specified article.
     */
    public function show($id) 
    {
        $article = Article::find($id);
        
        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }

        return response()->json($article);
    }

    /**
     * Update the specified article.
     * Used by Phase 2 (Node.js Evolution) to OVERWRITE original content.
     */
    public function update(Request $request, $id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }

        // Validate incoming data from the Evolution Service
        $validator = Validator::make($request->all(), [
            'title'      => 'string',
            'content'    => 'string',
            'author'     => 'string',
            'references' => 'nullable|array', // Validates JSON array from Node
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update the existing record with newly generated AI content
        $article->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Article evolved/updated successfully',
            'data' => $article
        ]);
    }

    /**
     * Remove the specified article.
     */
    public function destroy($id) 
    {
        $article = Article::find($id);
        
        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }

        $article->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Fetch the single latest article.
     */
    public function latest() 
    {
        $article = Article::latest()->first();
        
        if (!$article) {
            return response()->json(['message' => 'No articles found'], 404);
        }

        return response()->json($article);
    }
}