<script>
  import { sleep } from "../helpers.js";
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
  let activeButtonIdMap = {};

  $: ({ layout, bassLayout, buttonIdMap, scales } = tuningLayouts[tuning]);

  function handleChangeTuning(e) {
    const nextTuning = e.target.value;

    if (nextTuning === tuning) {
      return;
    }

    handleClearAllNotes();
    tuning = nextTuning;
  }

  // Handlers
  function playTone(id) {
    const { frequency } = buttonIdMap[id];
    let oscillator;

    if (Array.isArray(frequency)) {
      oscillator = frequency.map((hz) => {
        const oscillator = audio.createOscillator();
        oscillator.type = "sawtooth";
        oscillator.connect(gainNode);
        oscillator.frequency.value = hz;
        oscillator.start();

        return oscillator;
      });
    } else {
      oscillator = audio.createOscillator();
      oscillator.type = "sawtooth";
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

      // When switching the bellows
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

  async function playNotesInScale(idSet) {
    handleClearAllNotes();

    for (const id of idSet) {
      if (!activeButtonIdMap[id]) {
        const { oscillator } = playTone(id);

        activeButtonIdMap[id] = { oscillator, ...buttonIdMap[id] };
      }
    }

    await sleep(600);

    for (const id of idSet) {
      stopTone(id);
      const newActiveButtonIdMap = { ...activeButtonIdMap };
      delete newActiveButtonIdMap[id];
      activeButtonIdMap = newActiveButtonIdMap;
    }
  }

  function getScaleButtonIds(rowKey, interval) {
    const rowButtons = layout[rowKey].filter(({ id }) => id.includes("pull"));
    const startIndex = 5;
    const pattern = [0, 1, 2, 3, 4, 5, 6, 7];

    return pattern.map((offset, index) => {
      const first = rowButtons[startIndex + offset]?.id;

      if (interval === "thirds") {
        const third = rowButtons[startIndex + offset + 2]?.id;
        return index === pattern.length - 1
          ? [first]
          : [first, third].filter(Boolean);
      }

      return [first].filter(Boolean);
    });
  }

  const playScale = (rowKey, type) => async () => {
    const selectedScale = getScaleButtonIds(rowKey, type);
    const reverse = [...selectedScale].reverse();
    reverse.shift();
    const scaleBackAndForth = [...selectedScale, ...reverse];

    for (const idSet of scaleBackAndForth) {
      await playNotesInScale(idSet);
    }
  };
</script>

<svelte:body
  on:keypress={handleKeyPressNote}
  on:keyup={handleKeyUpNote}
  on:mouseup={handleClearAllNotes}
/>

<main>
  <div class="mobile-only">
    <div class="banner">This app is only available on a desktop!</div>
  </div>

  <div class="layout">
    <div class="keyboard-side">
      <div class="desktop-only accordion-layout">
        {#each rows as row}
          <div class="row {row}">
            {#each layout[row].filter( ({ id }) => id.includes(direction), ) as button}
              <div
                class={`circle ${activeButtonIdMap[button.id] ? "active" : ""} ${direction} `}
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
          <h1 class="title">Diatonic Accordion</h1>
          <div class="subtitle">
            Play the diatonic button accordion with your computer keyboard
          </div>
        </header>
        <div>
          <h3>How to use</h3>
          <ul>
            <li>
              Each key on the keyboard corresponds to a button on the accordion.
            </li>
            <li>
              Hold down <kbd>q</kbd> to <strong>push</strong> the bellows.
              Default is
              <strong>pull</strong>.
            </li>
            <li>
              The treble side buttons begin with <kbd>z</kbd>, <kbd>a</kbd>, and
              <kbd>w</kbd>
            </li>
            <li>
              The twelve bass buttons use the number row from <kbd>1</kbd> to
              <kbd>=</kbd>
            </li>
          </ul>
        </div>

        <div class="flex">
          <div>
            <h3>Tuning</h3>
            <select on:change={handleChangeTuning} bind:value={tuning}>
              <option value="FBE">FB♭E♭ (Fa)</option>
              <option value="GCF">GCF (Sol)</option>
              <option value="EAD">EAD (Mi)</option>
            </select>
          </div>
        </div>

        <div class="currently-playing">
          {#each Object.entries(activeButtonIdMap) as [id, value]}
            <div class="flex col">
              <div class="circle note">{value.name}</div>
              <div>
                <small
                  >Row: {id.split("-")[0]}<br /> Col: {id.split("-")[1]}</small
                >
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="bass-side">
      <div class="desktop-only accordion-layout">
        {#each bassRows as row}
          <div class="row {row}">
            {#each bassLayout[row].filter( ({ id }) => id.includes(direction), ) as button}
              <div
                class={`circle ${activeButtonIdMap[button.id] ? "active" : ""} ${direction} `}
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
