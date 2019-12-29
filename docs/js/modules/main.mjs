import { BuildOrder, Unit } from './build-order/build-order.mjs';
import { Simulation } from './build-order/simulation.mjs';

$(document).ready(function() {

    $.ajaxSetup({ cache: false });

    Unit.preload('json/units.json', function() {

        $.getJSON('examples/example-bo-1.json', function(json) {
            let i = 0;

            const bo = BuildOrder.fromJSON(json);
            const simulation = new Simulation(bo);
            const view = new BuildOrderView(bo);

            Unit.loadInto($('.bo-unit'));

            bo.subscribe('change', function() {
                $('#timeline-slider-range')
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

            $('.bo-form-add-unit').on('reset', function(e) {
                e.preventDefault();
                bo.clear();
            });

            // When add an unit, verify the conditions before adding it.
            $('.bo-form-add-unit').submit(function(e) {
                let i;
                const row = parseInt($(this).find('[name=row]').val());
                const unit = Unit.fromName($(this).find('[name=unit]').val());
                const time = (parseInt($(this).find('[name=minuts]').val()) || 0) * 60 + 
                                (parseInt($(this).find('[name=seconds]').val()) || 0);
                let ok = false;

                // Don't submit form
                e.preventDefault();

                // Can be NaN if no row selected (because no row available for this unit)
                if(!isNaN(row)) {

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
                }
                
                if(ok) {
                    bo.notify('change');
                }
                else {

                    // If can't, check nex time when it's available. Search only on 5 minutes...

                    for(i = 0; i < 5 * 60 && !ok; i++) {
                        simulation.advanceToNextSecond();

                        if(simulation.hasEnoughResourcesForUnit(unit)) {
                            if(row === -1) {
                                ok = true;
                            } else {
                                if(bo.getActions()[row].isEmptySpaceBetween(simulation.time, simulation.time + unit.getCost().time)) {
                                    ok = true;
                                }
                            }                            
                        }
                    }

                    if(ok) {
                        $('#next-time-avalaible').text('Next time available').show();
                        $('.bo-form-add-unit')
                            .find('[name=minuts]').val(Math.floor(simulation.time / 60)).end()
                            .find('[name=seconds]').val(simulation.time % 60).end()
                        ;
                    } else {
                        $('#next-time-avalaible').text('Not possible').show();
                    }
                }
            })

            // Initialise with fake change to populate the row with the first unit selected
            .find('[name=unit]').change();



            /* Slider for the timing of the simulation */
            $('#timeline-slider-range').change(function(e) {
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