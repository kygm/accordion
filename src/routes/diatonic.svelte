<script>
  import { keyMap } from "../data.js";
  import {
    bassKeyMap,
    tuningLayouts,
    rows,
    bassRows,
    rowTones,
    toggleBellows,
  } from "../diatonic-data.js";

  // Audio
  const audio = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = audio.createGain();
  gainNode.gain.value = 0.1;
  gainNode.connect(audio.destination);

  // State
  let direction = "pull";
  let tuning = "FBE";
  let language = "es";
  let activeButtonIdMap = {};

  $: ({ layout, bassLayout, buttonIdMap } = tuningLayouts[tuning]);

  const translations = {
    en: {
      title: "Diatonic Accordion",
      subtitle:
        "Play the diatonic button accordion with your computer keyboard",
      language: "Language",
      english: "English",
      spanish: "Spanish",
      howToUse: "How to use",
      desktopOnly: "This app is only available on a desktop!",
      tuning: "Tuning",
      currentlyPlaying: "Currently Playing",
      row: "Row",
      col: "Col",
      instructions: [
        "Each key on the keyboard corresponds to a button on the accordion.",
        "Hold down q to push the bellows. Default is pull.",
        "The treble side buttons begin with z, a, and w.",
        "The twelve bass buttons use the number row from 1 to =.",
      ],
      push: "push",
      pull: "pull",
    },
    es: {
      title: "Acordeón Diatónico",
      subtitle:
        "Toca el acordeón diatónico de botones con el teclado de tu computadora",
      language: "Idioma",
      english: "Inglés",
      spanish: "Español",
      howToUse: "Cómo usar",
      desktopOnly:
        "¡Esta aplicación solo está disponible en una computadora de escritorio!",
      tuning: "Afinación",
      currentlyPlaying: "Sonando Ahora",
      row: "Fila",
      col: "Col",
      instructions: [
        "Cada tecla del teclado corresponde a un botón del acordeón.",
        "Mantén presionada la tecla q para empujar el fuelle. El valor predeterminado es jalar.",
        "Los botones del lado derecho comienzan con z, a y w.",
        "Los doce botones del bajo usan la fila numérica desde 1 hasta =.",
      ],
      push: "empujar",
      pull: "jalar",
    },
  };

  $: t = translations[language];

  function handleChangeTuning(e) {
    const nextTuning = e.target.value;

    if (nextTuning === tuning) {
      return;
    }

    handleClearAllNotes();
    tuning = nextTuning;
  }

  function handleChangeLanguage(e) {
    language = e.target.value;
  }

  function playTone(id) {
    const { frequency } = buttonIdMap[id];
    let oscillator;

    if (Array.isArray(frequency)) {
      oscillator = frequency.map((hz) => {
        const osc = audio.createOscillator();
        osc.type = "square";
        osc.connect(gainNode);
        osc.frequency.value = hz;
        osc.start();
        return osc;
      });
    } else {
      oscillator = audio.createOscillator();
      oscillator.type = "square";
      oscillator.connect(gainNode);
      oscillator.frequency.value = frequency;
      oscillator.start();
    }

    return { oscillator };
  }

  function stopTone(id) {
    const { oscillator } = activeButtonIdMap[id] || {};

    if (Array.isArray(oscillator)) {
      oscillator.forEach((osc) => osc?.stop());
    } else {
      oscillator?.stop();
    }
  }

  function getReverseKeyId(keyId, newDirection) {
    const parts = keyId.split("-");
    const isBass = parts[parts.length - 1] === "bass";

    if (isBass) {
      return `${parts[0]}-${parts[1]}-${newDirection}-bass`;
    }

    return `${parts[0]}-${parts[1]}-${newDirection}`;
  }

  function handleToggleBellows(newDirection) {
    if (direction !== newDirection) {
      direction = newDirection;

      const newActiveButtonIdMap = { ...activeButtonIdMap };

      for (const [keyId, keyValues] of Object.entries(activeButtonIdMap)) {
        if (Array.isArray(keyValues.oscillator)) {
          keyValues.oscillator.forEach((osc) => osc?.stop());
        } else {
          keyValues.oscillator?.stop();
        }

        delete newActiveButtonIdMap[keyId];

        const reverseKeyId = getReverseKeyId(keyId, newDirection);
        const { oscillator } = playTone(reverseKeyId);

        newActiveButtonIdMap[reverseKeyId] = {
          oscillator,
          ...buttonIdMap[reverseKeyId],
        };
      }

      activeButtonIdMap = newActiveButtonIdMap;
    }
  }

  function updateActiveButtonMap(id) {
    if (!activeButtonIdMap[id]) {
      const { oscillator } = playTone(id);
      activeButtonIdMap[id] = { oscillator, ...buttonIdMap[id] };
    }
  }

  function handleKeyPressNote(e) {
    const key = `${e.key}`.toLowerCase() || e.key;

    if (key === toggleBellows) {
      handleToggleBellows("push");
      return;
    }

    const buttonMapData = keyMap[key];

    if (buttonMapData) {
      const { row, column } = buttonMapData;
      const id = `${row}-${column}-${direction}`;
      return updateActiveButtonMap(id);
    }

    const bassButtonMapData = bassKeyMap[key];
    if (bassButtonMapData) {
      const { row, column } = bassButtonMapData;
      const id = `${row}-${column}-${direction}-bass`;
      return updateActiveButtonMap(id);
    }
  }

  function handleKeyUpNote(e) {
    const key = `${e.key}`.toLowerCase() || e.key;

    if (key === toggleBellows) {
      handleToggleBellows("pull");
      return;
    }

    const buttonMapData = keyMap[key];

    if (buttonMapData) {
      const { row, column } = buttonMapData;
      const id = `${row}-${column}-${direction}`;

      if (activeButtonIdMap[id]) {
        stopTone(id);
        const newActiveButtonIdMap = { ...activeButtonIdMap };
        delete newActiveButtonIdMap[id];
        activeButtonIdMap = newActiveButtonIdMap;
      }
    }

    const bassButtonMapData = bassKeyMap[key];

    if (bassButtonMapData) {
      const { row, column } = bassButtonMapData;
      const id = `${row}-${column}-${direction}-bass`;

      if (activeButtonIdMap[id]) {
        stopTone(id);
        const newActiveButtonIdMap = { ...activeButtonIdMap };
        delete newActiveButtonIdMap[id];
        activeButtonIdMap = newActiveButtonIdMap;
      }
    }
  }

  const handleClickNote = (id) => {
    updateActiveButtonMap(id);
  };

  const handleClearAllNotes = () => {
    for (const [, keyValues] of Object.entries(activeButtonIdMap)) {
      if (Array.isArray(keyValues.oscillator)) {
        keyValues.oscillator.forEach((osc) => osc?.stop());
      } else {
        keyValues.oscillator?.stop();
      }
    }
    activeButtonIdMap = {};
  };
</script>

<svelte:body
  on:keypress={handleKeyPressNote}
  on:keyup={handleKeyUpNote}
  on:mouseup={handleClearAllNotes}
/>

<main>
  <div class="mobile-only">
    <div class="banner">{t.desktopOnly}</div>
  </div>

  <div class="layout">
    <div class="keyboard-side">
      <div class="desktop-only accordion-layout">
        {#each rows as row}
          <div class="row {row}">
            {#each layout[row].filter( ({ id }) => id.includes(direction), ) as button}
              <div
                class={`circle ${activeButtonIdMap[button.id] ? "active" : ""} ${direction}`}
                id={button.id}
                on:mousedown={() => handleClickNote(button.id)}
              >
                {button.name}
              </div>
            {/each}
            <h4>{rowTones[tuning][row]}<br />{row}</h4>
          </div>
        {/each}
      </div>
    </div>

    <div class="information-side">
      <div class="information">
        <header class="header">
          <div class="top-selectors">
            <div class="selector-group">
              <label for="language-select">{t.language}</label>
              <select
                id="language-select"
                on:change={handleChangeLanguage}
                bind:value={language}
              >
                <option value="en">{t.english}</option>
                <option value="es">{t.spanish}</option>
              </select>
            </div>

            <div class="selector-group">
              <label for="tuning-select">{t.tuning}</label>
              <select
                id="tuning-select"
                on:change={handleChangeTuning}
                bind:value={tuning}
              >
                <option value="FBE">FB♭E♭ (Fa)</option>
                <option value="GCF">GCF (Sol)</option>
                <option value="EAD">EAD (Mi)</option>
              </select>
            </div>
          </div>

          <h1 class="title">{t.title}</h1>
          <div class="subtitle">{t.subtitle}</div>
        </header>

        <div>
          <h3>{t.howToUse}</h3>
          <ul>
            <li>{t.instructions[0]}</li>
            <li>
              {#if language === "en"}
                Hold down <kbd>q</kbd> to <strong>{t.push}</strong> the bellows.
                Default is
                <strong>{t.pull}</strong>.
              {:else}
                Mantén presionada la tecla <kbd>q</kbd> para
                <strong>{t.push}</strong>
                el fuelle. El valor predeterminado es <strong>{t.pull}</strong>.
              {/if}
            </li>
            <li>{t.instructions[2]}</li>
            <li>{t.instructions[3]}</li>
          </ul>
        </div>

        <div class="currently-playing-wrapper">
          <h3>{t.currentlyPlaying}</h3>
          <div class="currently-playing">
            {#each Object.entries(activeButtonIdMap) as [id, value]}
              <div class="flex col">
                <div class="circle note">{value.name}</div>
                <div>
                  <small
                    >{t.row}: {id.split("-")[0]}<br />{t.col}: {id.split(
                      "-",
                    )[1]}</small
                  >
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="bass-side">
      <div class="desktop-only accordion-layout">
        {#each bassRows as row}
          <div class="row {row}">
            {#each bassLayout[row].filter( ({ id }) => id.includes(direction), ) as button}
              <div
                class={`circle ${activeButtonIdMap[button.id] ? "active" : ""} ${direction}`}
                id={button.id}
                on:mousedown={() => handleClickNote(button.id)}
              >
                {button.name}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>
