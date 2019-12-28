$(document).ready(function() {

    $.getJSON('./json/units.json', function(json) {

        LoadUnitsFromJSON(json);

        const bo = new BuildOrder;
        let base = new Base(bo);

        /*bo.buildUnit(0, "SCV", 0);
        bo.buildUnit(12, "SCV", 0);
        bo.buildUnit(24, "SCV", 0);
        bo.buildUnit(36, "SCV", 0);
        bo.buildUnit(60, "Refinery");
        bo.buildUnit(14, "Supply Depot");
        const barracks = bo.buildUnit(15, "Barracks");
        bo.buildUnit(60, "Reaper", barracks);*/


        // Initialise available units to build

        const $select = $('.select-units-list');
        $.each(json, function(i) {
            const unit = json[i];
            $select.append($('<option>').val(unit.unit).text(unit.unit));
        })

        // Add a building to the build order

        $('.form-add-queue').submit(function(e) {
            const unit = $select.val();
            let time = toSeconds($('.form-add-queue .time').val());
            let row = $('.select-production-facility-row').val();
            row = (parseInt(row) === 0) ? null : row - 1;

            if(isNaN(time)) {
                time = 0;
            }

            console.log("Build unit " + unit + " at time " + time + " at row " + row);
            bo.buildUnit(time, unit, row);
            bo.display();

            return false;
        });

        // Change the current time of the simulation

        $('.slider-timeline').change(function(e) {

            // Get the time from the input
            const time = Math.floor($(this).val() / $(this).attr('max') * bo.maxTime);
            let i;

            // Update the texts
            $('.bo-slider-current-timeline').val(formatTime(time));

            // Reset the simulation and advance to current time
            base = new Base(bo);
            base.display();

            for(i = 0; i < time; i++) {
                base.advanceToNextSecond();
            }

            base.display();
        });

        bo.display();
    });
});
