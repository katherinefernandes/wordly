"use client";

// useState is a React "hook".
// It lets our component remember information even when React re-renders the page.
import { useEffect, useState } from "react";


type Word = {
  id: number;
  word: string;
  translation: string;
  frequencyRank: number;
};

type Classification = {
  id: number;
  status: string;
  wordId: number;
};

// This is our React component.
//
// In Next.js, src/app/page.tsx represents the "/" page.
// So this component is what the user sees when they visit localhost:3000.
export default function Home() {

  // Words retrieved from our API/database.
  //
  // We start with an empty array because the API
  // hasn't responded yet when the page first loads.
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    async function loadData() {
      // Ask our backend for both resources.
      const wordsResponse = await fetch("/api/words");
      const classificationsResponse = await fetch("/api/classifications");

      // Convert both JSON responses into JavaScript objects.
      const wordsData: Word[] = await wordsResponse.json();
      const classificationsData: Classification[] =
        await classificationsResponse.json();

      // Store the words in React state.
      setWords(wordsData);

      // Convert the database classifications into the format
      // our existing React state uses.
      const classificationMap: Record<string, string> = {};

      for (const classification of classificationsData) {
        const word = wordsData.find(
          (word) => word.id === classification.wordId
        );

        if (word) {
          classificationMap[word.word] = classification.status;
        }
      }

      setClassifications(classificationMap);
    }

    loadData();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "1") {
        classify("UNKNOWN");
      }

      if (event.key === "2") {
        classify("ALMOST");
      }

      if (event.key === "3") {
        classify("KNOWN");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  // STATE
  // -----
  //
  // currentIndex stores which word we are currently displaying.
  //
  // useState(0) means:
  // "Start with the value 0."
  //
  // currentIndex     = the current value
  // setCurrentIndex  = function we use to change that value
  //
  // Initially:
  // currentIndex = 0
  //
  // After clicking a button:
  // currentIndex = 1
  // then 2, 3, 4...
  const [currentIndex, setCurrentIndex] = useState(0);

  // Stores the classifications made by the user.
  //
  // Example:
  // {
  //   alligevel: "KNOWN",
  //   nemlig: "ALMOST"
  // }
  const [classifications, setClassifications] = useState<
    Record<string, string>
  >({});


  // Get the word corresponding to the current index.
  //
  // Example:
  //
  // currentIndex = 0  → words[0] → "alligevel"
  // currentIndex = 1  → words[1] → "nemlig"
  // currentIndex = 2  → words[2] → "måske"
  const currentWord = words[currentIndex];

  if (!currentWord) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading words...</p>
      </main>
    );
  }



  async function classify(status: string) {
    // Send the classification to our Next.js backend.
    const response = await fetch("/api/classifications", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        wordId: currentWord.id,
        status: status,
      }),
    });

    // Something went wrong on the server.
    if (!response.ok) {
      console.error("Failed to save classification");
      return;
    }

    // Update our local React state too.
    setClassifications({
      ...classifications,
      [currentWord.word]: status,
    });

    // Move to the next word.
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }


  // Everything inside return (...) describes
  // what should appear in the browser.
  //
  // This syntax is called JSX.
  //
  // It looks like HTML, but we can also insert
  // JavaScript values using { }.
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">

      <div className="w-full max-w-xl px-6">

        <div className="mb-12 text-center">

          <p className="mb-8 text-sm font-semibold tracking-widest text-zinc-500">
            🇩🇰 DANISH
          </p>


          {/* 
            Display the Danish word.

            Because currentWord changes when currentIndex changes,
            this text automatically changes too.
          */}
          <h1 className="text-5xl font-semibold text-zinc-900">
            {currentWord.word}
          </h1>


          {/* Display the English translation */}
          <p className="mt-4 text-lg text-zinc-500">
            {currentWord.translation}
          </p>

        </div>


        {/* Container holding our three classification buttons */}
        <div className="grid grid-cols-3 gap-3">

          <button
            // When clicked, call classify() and pass UNKNOWN.
            onClick={() => classify("UNKNOWN")}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-700 hover:bg-zinc-100"
          >
            Don't know
          </button>


          <button
            // Same function, but this time status = "ALMOST".
            onClick={() => classify("ALMOST")}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-700 hover:bg-zinc-100"
          >
            Almost
          </button>


          <button
            // And here status = "KNOWN".
            onClick={() => classify("KNOWN")}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-white hover:bg-zinc-700"
          >
            Know
          </button>

        </div>


        {/* 
          Progress indicator.

          We add 1 because humans normally count from 1,
          while JavaScript arrays start at 0.

          currentIndex = 0 → displays 1 / 5
          currentIndex = 1 → displays 2 / 5
        */}
        <p className="mt-8 text-center text-sm text-zinc-400">
          {currentIndex + 1} / {words.length}
        </p>
        
        <pre className="mt-8 rounded-xl bg-zinc-900 p-4 text-left text-sm text-white">
          {JSON.stringify(classifications, null, 2)}
        </pre>
      </div>
    </main>
  );
}