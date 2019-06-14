// main jQuery stuff
$('document').ready(function () {

  $("#samples").hide();

  // debug on (1) or off (0) (NOTE: implement into options)
  var debug = 0;

  // initialize volume slider
  // $("#slider").slider();

  var options = { 

    // 0 for slow, 1 for fast
    _duration: 1,

    _octaves: 1,
    get octaves() { return this._octaves; },
    set octaves(value) { this._octaves = value; },
  }

  // score object
  var score = {

    _interval: 0,
    _accuracy: 0,
    _correct: 0,
    _incorrect: 0,

    get interval() { return this._interval; },
    get accuracy() { return this._accuracy; },
    get correct() { return this._correct; },
    get incorrect() { return this._incorrect; },
    
    updateAccuracy() {
      if (this._correct > 0) {
        this._accuracy = 100 * (this._correct / (this._correct + this._incorrect));
      }
      else {
        this._accuracy = 0;
      }
      $("#accuracy")[0].innerHTML = this._accuracy.toFixed(2) + "%"; //= +(Math.round(this._accuracy + "e+2")  + "e-2") + "%";
    },
    // set interval
    set interval(value) { this._interval = value; },
    // # of correct guesses
    set correct(value) {
      this._correct = value;
      $("#correct")[0].innerHTML = this._correct;
      this.updateAccuracy();

    },
    // # of incorrect guesses
    set incorrect(value) {
      this._incorrect = value; 
      $("#incorrect")[0].innerHTML = this._incorrect;
      this.updateAccuracy();
    },
  }

  // hardcode audio sample names
  var sounds = [];
  var letter;
  for (let i = 0; i < 23; i++) {
    // if we're on a new octave, set letter to 'a'
    if (i % 12 == 0) {
      letter = 'a';
    }

    // get current octave
    let octave = i < 12 ? 1 : 2;

    // set current sound name to current note (letter + octave)
    sounds[i] = "" + letter + octave;
    if (debug) console.log("Added letter " + sounds[i]);

    // if letter has a sharp,
    if (letter != 'b' && letter != 'e') {
      // set next element to the current note sharped
      sounds[++i] = "" + letter + octave + "s";
      if (debug) console.log("Added letter " + sounds[i]);
    }

    // increment to next letter
    letter = String.fromCharCode(letter.charCodeAt() + 1)
  }

  // populate audio array with notes
  var audio = [];
  for (let i = 0; i < sounds.length; i++) {
    // dynamically allocate a new audio object and set its src
    audio[sounds[i]] = new Audio();
    audio[sounds[i]].src = "audio/" + sounds[i] + ".wav";
  }

  /* 
   * Trainer logic
   */

  // declare vars to hold last two notes played (-1 means not played yet)
  var note1 = note2 = -1;

  // play button click event
  $("#play").click(function () {

    $("#action").text("Guess!");

    // if any checkbox children of the "intervals" fieldset of options is checked,
    if ($("input[name=intervals]:checked").length > 0) {

      // if user hasn't guessed from last round, add to incorrect guesses
      if (note1 >= 0 && note2 >= 0) {

        score.incorrect = score.incorrect + 1;
      }

      // loop until interval is within user's selected intervals
      do {

        // get two random notes
        if (options.octaves == 1) {

          note1 = Math.floor(Math.random() * 11);
          note2 = Math.floor(Math.random() * 11) + note1;
        }
        else if (options.octaves == 2) {

          note1 = Math.floor(Math.random() * 11);
          note2 = Math.floor(Math.random() * 23);
        }

        // if notes are same, change octave of one or both
        if (note2 == note1 && note1 < 12)
          note2 += 12;
        else if (note2 == note1 && note1 >= 12)
          note2 -= 12;

        // determine interval between notes
        if (note2 > note1) {
          score.interval = note2 - note1;
        }
        else if (note1 > note2) {
          score.interval = note1 - note2;
        }
        else {
          console.log("Error: Problem determining answer interval.");
        }

        // make sure interval is not in imaginary octave
        if (score.interval >= 12) 
          score.interval -= 12;

        // ensure interval is within user-selected intervals
        if (!$("input[name=intervals]")[score.interval].checked) {

          score.interval = -1;
        }
      } while (score.interval < 0);

      // play the two notes at the same time (determine duration first)
      let sound1 = audio[sounds[note1]];
      let sound2 = audio[sounds[note2]];
      // set short-duration sounds (to be added later)
      if (options.duration == 0) {

        alert("Error: Sounds have not been defined for duration 0 (slow).");
      }
      // set long-duration sounds (to be added later)
      else if (options.duration == 1) {
        
      }
      if (!sound1.paused || sound1.currentTime) {
        if (sound1.volume > 0) {
          sound1.animate({volume:0});
        }
        sound1.pause();
        sound1.currentTime = 0;
      }
      if (!sound2.paused || sound2.currentTime) {
        if (sound2.volume > 0) {
          sound2.animate({volume:0});
        }
        sound2.pause();
        sound2.currentTime = 0;
      }
      audio[sounds[note1]].play();
      audio[sounds[note2]].play();

      // log which sounds are played
      if (debug) {
        console.log("Playing sound #" + note1 + " and #"
            + note2 + " (" + sounds[note1] + ", " + sounds[note2]
            + "), " + score.interval
            + " (" + $(".note")[score.interval].innerHTML + ")");
      }
    }
    // else (user has no intervals selected)
    else {

      alert("Error: You must select at least one interval.");
    }
  });

  // if user clicked a button to guess a note
  $(".note").click(function () {

    $("#action").text("Hit play!");
  
    // if no notes were played, lol @cha
    if (note1 == -1 || note2 == -1) {

      alert("Click 'Play' before guessing an interval.");
    }
    // else,
    else {
      // get user's guess
      let guess = $(this).attr('id');

      // if guess is equal to the note interval
      if (guess == $(".note")[score.interval].id) {

        // animate a "+1" piece of text that floats near the "correct" box

        // increase correct guesses
        if (debug) console.log("CORRECT! Guess: " + guess + ", interval: " + $(".note")[score.interval].id);
        score.correct = score.correct + 1;
      }
      // else (guess was wrong),
      else {

        // increase incorrect guesses
        if (debug) console.log("Incorrect... Guess: " + guess + ", interval: " + $(".note")[score.interval].id);
        score.incorrect = score.incorrect + 1;
      }

      // show the last answer interval
      $("#last")[0].innerHTML = $(".note")[score.interval].innerHTML;

      // reset notes
      note1 = -1;
      note2 = -1;
    }
  });

  $("#reset").click(function() {

    score.correct = 0;
    score.incorrect = 0;
    note1 = -1;
    note2 = -1;
  });

  $("#practice").click(function() {

    $("*").hide();
    $("#samples").show();
    $("#hideSamples").show();
  });

  $("input[name=octaves").click(function() {

    options.octaves = $("input[name=octaves]:checked")[0].value;
  });

  $("#uncheckAll").click(function() {

    $("input[name=intervals]").prop('checked', false);
  });

  $("#checkAll").click(function() {

    $("input[name=intervals]").prop('checked', true);
  });

  $("#instructions").click(function() {

    alert("The trainer will play two notes. The first is the root, which"
    + " is chosen randomly from the notes you select here.\n\n"
    + "The second note is an interval of the root note, which is"
    + " chosen randomly from the intervals you select here.\n\n"
    + "You must use your ear to guess which interval is played.\n\n"
    + "(Zero selections here plays all options at random.)");
  });
});