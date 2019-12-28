<?php
header("Cache-Control: no-cache, must-revalidate");
?>

<!doctype html>
<html lang="en">
  <head>
    <title></title>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

    <style>
        @font-face {
            font-family: StarcraftNormal;
            src: url("assets/Starcraft Normal.ttf");
        }

        * {
            font-family: StarcraftNormal;
            font-size: 0.98em;
        }
    </style>
  </head>
  <body>


    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
    <script src="/vendor/sorted-array.js"></script>
    <script src="type-checker.js"></script>
    <script src='observer.js'></script>
    <script src="action.js"></script>
    <script src="build.js"></script>
    <script src="build-order.js"></script>
    <script src="json.js"></script>
    <script src='race.js'></script>
    <script src='time.js'></script>
    <script src='unit.js'></script>
    <script src='view.js'></script>
    <script src='simulation.js'></script>

    <div class='container'>
        <div class='row'>
            <div class='col'>
                <div>BO</div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col" id="timeline">

                <!-- Percent slider, 'max' highest value to have maximum precision (can be approximative to < one second) -->
                <!-- Also have less range is easier for input at keyboard, because arrows will move by one
                     If max is ten million, keyboard press will do nothin and we will must wait a very long time to see a modification
                -->
                <div>Time: <span class="time"></span></div>
                <div>Minerals: <span class="mineral"></span></div>
                <div>Gas: <span class="gas"></span></div>
                <div>Harvesters at mineral: <span class="mineral_harvesters"></span></div>
                <div>Harvesters at gas: <span class="gas_harvesters"></span></div>
                <div>Suply: <span class="supply"></span>/<span class="max_supply"></span></div>
                <input type="range" min="0" max="100" class="w-100">
            </div>
        </div>
        <div class='row'>
            <div class='col'>
                <table class='table table-dark' style="table-layout: fixed;"></table>
            </div>
        </div>
        <div class='row'>
            <div class='col'>
                <form class='form bo-form-add-unit'>
                    Add:
                    <select class='bo-unit' name='unit'>
                    </select>
                    From:
                    <select class='bo-row' name='row'>
                    </select>
                    At:
                    <input type="number" placeholder="minuts" min="0" max="30" step="1" name="minuts">
                    :
                    <input type="number" placeholder="seconds" min="0" max="59" step="1" name="seconds">
                    <input type="submit">
                </form>
            </div>
        </div>
    </div>

    <script>

        $(document).ready(function() {

            $.ajaxSetup({ cache: false });

            Unit.preload('../../json/units.json', function() {

                $.getJSON('./../../examples/example-bo-1.json', function(json) {
                    let i = 0;

                    const bo = BuildOrder.fromJSON(json);
                    const simulation = new Simulation(bo);
                    const view = new BuildOrderView(bo);

                    Unit.loadInto($('.bo-unit'));

                    bo.subscribe('change', function() {
                        $('#timeline input[type=range]')
                            .attr('max', bo.duration())
                            .change(); // Force update simulation info.
                    });

                    bo.subscribe('change', function() {
                        view.renderInto($('table'));
                    });

                    // When he unit to build change, search available buildings, that is a row, where to build

                    $('.bo-unit').change(function(e) {
                        const unit = Unit.fromName($(this).val());
                        let i;
                        let action;

                        $('.bo-row').empty();

                        if(unit.hasParent()) {
                            // Search a row where the building corresponds
                            for(i = 0; i < bo.getActions().length; i++) {
                                action = bo.getActions()[i];

                                if(action instanceof Build && action.getUnit() === unit.getParent()) {
                                    $('.bo-row').append(
                                        $('<option>')
                                            .val(i)
                                            .text(i + 1)
                                    );
                                }
                            }
                        } else {
                            // If the unit is built from scratch, the only available option is create a new row.
                            // The collapse is not taken into consideration
                            $('.bo-row').html($('<option>').val('-1').text('New Row'));
                        }
                    });

                    // When add an unit, verify the conditions before adding it.
                    $('.bo-form-add-unit').submit(function(e) {
                        let i;
                        const row = parseInt($(this).find('[name=row]').val());
                        const unit = Unit.fromName($(this).find('[name=unit]').val());
                        const time = (parseInt($(this).find('[name=minuts]').val()) || 0) * 60 + 
                                     (parseInt($(this).find('[name=seconds]').val()) || 0);
                        let ok = false;

                        console.log(time);

                        // Don't submit form
                        e.preventDefault();

                        // Run simulation until desired time and check if it is possible                        
                        simulation.goToSecond(time);

                        if(simulation.hasEnoughResourcesForUnit(unit)) {
                            // Enough resources but didn't checked if there is a building
                            // Check now if there is an avalaible building
                            // This now depend not on the simulation but on the build order
                            // The difference is that the simulation is not exact, but the timing can be known exactly
                            // And we can know if the queue is empty.

                            /* row = -1 => unit is built in a new row */
                            if(row === -1) {
                                bo.addAction(new Build(time, unit.getName()));
                                ok = true;
                            } else {

                                // Check there is space to produce the unit at this point of time
                                if(bo.getActions()[row].isEmptySpaceBetween(time, time + unit.getCost().time)) {
                                    bo.getActions()[row].addAction(new Build(time, unit.getName()));
                                    ok = true;
                                }
                            }                            
                        }
                        
                        if(ok) {
                            bo.notify('change');
                        }
                        else {
                            alert("can't");
                        }
                    })

                    // Initialise with fake change to populate the row with the first unit selected
                    .find('[name=unit]').change();



                    /* Slider for the timing of the simulation */
                    $('#timeline input[type=range]').change(function(e) {
                        const time = parseInt($(this).val());

                        simulation.goToSecond(time);

                        ['time', 'mineral', 'gas', 'supply', 'max_supply', 'mineral_harvesters', 'gas_harvesters'].forEach(function(attr) {
                            let value = simulation[attr];

                            if(typeof value === 'number') {
                                value = Math.round(value);
                            }
                            if(attr === 'time') {
                                value = formatTime(value);
                            }

                            $('#timeline').find('.' + attr).text(value);
                        });
                    });
                    
                    // Force initialise UI
                    bo.notify('change');
                });
            });
        });

    </script>
  </body>
</html>
