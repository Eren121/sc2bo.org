/**
 * Format input integer seconds to mm:ss format.
 */
function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;

    if(mins < 10) mins = '0' + mins;
    if(secs < 10) secs = '0' + secs;

    return mins + ':' + secs;
}

/**
 * Reversed function 
 */
function toSeconds(mmSS) {
    const array = mmSS.split(':');

    if(array.length == 1) {
        return parseInt(array[0]);
    } else {
        return parseInt(array[0]) * 60 + parseInt(array[1]);
    }
}

function DisplayAdvancementOfBuildOrder(base) {
    $('.bo-current-mineral').text(Math.round(base.resources.mineral));
    $('.bo-current-gas').text(Math.round(base.resources.gas));
    $('.bo-current-supply').text(base.supply.current);
    $('.bo-current-max-supply').text(base.supply.max);
    $('.bo-current-total-worker-count').text(base.workers.total);
    $('.bo-current-gas-worker-count').text(base.workers.gas);
}

function DisplayBuildOrder(buildOrder) {
    let i, $tr, $th, $td, row, action, colspan;

    const $table = $('.bo-table');
    const $tbody = $('<tbody>');

    const padding = [0]; // Padding for each row, contains the last occuped space for each line in a line.
                         // The first row: the main production building is created at begining of the game also padding zero implicitly.

    $table.empty();

    // Create one Row for each Production row
    for(i = 0; i < buildOrder.productionRows.length; i++) {
        row = buildOrder.productionRows[i];
        $tr = $('<tr>');
        $tbody.append($tr);

        if(i !== 0) {
            padding.push(row.time + GetUnit(row.unit).cost.time);
        }
    }

    // Also, there is a <td> before the <th> but it seems to be valid html.

    $table.append($tbody);

    // Add production
    // Iterate all action, but to do that we need to copy the priority queue
    // Because we can't get n-th element in a priority queue
    
    for(i = 0; i < buildOrder.actions.length; i++) {
        action = buildOrder.actions.get(i);

        if(!(action instanceof StartUnit)) {
            continue;
        }

        const u = GetUnit(action.unit);
        console.log(u);

        $tr = $tbody
            .children('tr')
            .eq(action.parent);
        
        if(action.time - padding[action.parent] > 0) {
            // In the if because colspan=0 doesn't works: https://teamtreehouse.com/community/why-not-use-colspan0
            $tr.append(
                $('<td>')
                    .attr('colspan', action.time - padding[action.parent])
            );
        }

        $tr.append(
            $('<td>')
                .attr('colspan', u.cost.time)
                .html(action.unit)
                .append(
                    $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
                        .attr('data-action-uuid', action.uuid)
                        .click(function(e) {
                            buildOrder.removeAction(parseInt($(this).attr('data-action-uuid')));
                            buildOrder.display();
                        })
                )
        );

        // Add padding before:
        // For example if between two units created there is a gap, we need to represent this gap.

        padding[action.parent] = action.time + GetUnit(action.unit).cost.time;
    }

    // Prepend timeline
    // Header for time

    const $thead = $('<thead>');
    $tr = $('<tr>');
    const headerTimeWeight = 30; // 30s each col. in the header

    for(i = 0; i + headerTimeWeight < buildOrder.maxTime; i += headerTimeWeight) {
        $tr.append($('<td>').attr('colspan', headerTimeWeight).text(formatTime(i)));
    }

    // Last remaining time (may be not multiple of time)
    if(i !== buildOrder.maxTime) {
        $tr.append($('<td>').attr('colspan', buildOrder.maxTime - i).text(formatTime(i)));
    }


    // Complete last cell to have same number of colspan for each row

    // Complete row with empty <td>, if the remaining time is not 0, the time is not completed
    // The last unit created ended is different from the build order time

    for(i = 0; i < buildOrder.productionRows.length; i++) {
        colspan = buildOrder.maxTime - padding[i];

        if(colspan > 0) {
            $tbody.find('tr').eq(i).append($('<td>')
                .attr('colspan', colspan)
                .attr('data-bo-time', padding[i])
                .attr('data-bo-row', i + 1));
        }
    }

    $thead.append($tr);
    $table.prepend($thead);

    // Update selection for Adding new production facility
    $('.select-production-facility-row').html('<option value="0">New building</option>');

    for(i = 0; i < buildOrder.productionRows.length; i++) {
        $('.select-production-facility-row').append(
            $('<option>').val(i + 1).text(i + 1)
        );
    }

    // When selecting last column of a row, update the time to the begining time of the <td>
    // Is it to select time to queue unit in the same production facility that productions are tighly packed

    $tbody.find('tr td:last-child').click(function(e) {
        $('.time').val($(this).attr('data-bo-time'));
        $('.select-production-facility-row').val($(this).attr('data-bo-row'));
    });
}