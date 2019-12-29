export { BuildOrderView };

/**
 *  Render a Build Order into a HTML view
 * Use <table> element
 */

class BuildOrderView {
    constructor(bo) {
        as(bo, BuildOrder);
        this.bo = bo;
        this.maxTime = bo.duration();
    }

    /**
     *  Replace <table> content by this build order representation.
     *
     * <table>
     *     <thead>
     *     </thead>
     *     <tbody>
     *         <tr>
     *             <td></td>
     *         </tr>
     *     </tbody>
     * </table>
     **/
    renderInto($table) {
        this.maxTime = this.bo.duration();

        const $thead = $('<thead>');
        const $tbody = $('<tbody>');

        this.renderBody($tbody);
        this.renderHead($thead);

        $table
            .empty()
            .append($thead)
            .append($tbody);
    }

    renderHead($thead) {
        let i;
        const timeInterval = 30;

        for(i = 0; i < this.maxTime; i += timeInterval) {
            $thead.append(
                this.createEmptyCell(Math.min(timeInterval, this.maxTime - i))
                    .text(formatTime(i))
            );
        }
    }

    renderBody($tbody) {
        const actions = this.bo.getActions();
        let action;
        let i;
        let $tr;

        for(i = 0; i < actions.length; i++) {
            action = actions[i];

            $tr = $('<tr>');
            this.renderOneRow(action, $tr);

            $tbody.append($tr);
        }
    }

    // Render one basic building
    renderOneRow(build, $tr) {
        const actions = build.getActions();
        let action;
        let i;
        let currentTiming = build.getTime() + build.getDuration();
        let nextTiming;

        $tr.append(this.createEmptyCell(build.getTime()));
        $tr.append(this.createCell(build));

        for(i = 0; i < actions.length; i++) {
            action = actions[i];
            nextTiming = action.getTime() + action.getDuration();

            $tr.append(this.createEmptyCell(action.getTime() - currentTiming));
            $tr.append(this.createCell(action));

            currentTiming = nextTiming;
        }

        $tr.append(this.createEmptyCell(this.maxTime - currentTiming));
    }

    // Create one cell (<td> from an action).
    // After that, the cell should be placed in the right timing column.
    createCell(action) {
        if(action.getDuration() > 0) {
            const $td = $('<td>')
                .attr('colspan', action.getDuration())
                .attr('rowspan', 1)
                //.text(action.getDescription())
                .addClass(action instanceof Build ? 'bg-success' : 'bg-info')
                .addClass('rounded-pill overflow-hidden')
                ;
            
            // Add remove Icon
            //$td.attr('data-uuid', action.uuid);

            $td.append(

                $(`
                <button type="button" class="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                `)
                
                    .click(function() {
                        this.bo.removeAction(action);
                    })
            );

            if(action instanceof Build) {
                // Add icon if Action is Build
                let url = action
                    .getUnit()
                    .getName()
                    .toLowerCase()
                    .replace(' ', '-');

                url = './assets/' + url + '.png';

                const $img = $('<img>')
                    .attr('src', url)
                    .addClass('img-fluid p-0 m-0')
                    .css('max-width', '48px')
                    .css('max-height', '48px');

                $td
                    .addClass('p-0 m-0 text-center')
                    .append($img)
                    ;

                if(action.getCount() > 1) {
                    $td.append($('<div>')
                        .addClass('figure small')
                        .text('x' + action.getCount()));
                }
            }

            return $td;
        } else {
            return $(document.createTextNode(''));
        }
    }

    // Create an empty cell for padding between cells for unused space
    // Work with zero width, case is threated separatly
    createEmptyCell(width) {

        // Special case for the zero width, because colspan=0 means another thing.
        if(width > 0) {
            return $('<td>')
                .attr('colspan', width)
                .attr('rowspan', 1)
                //.addClass('bg-warning')
                ;
        } else {
            return $(document.createTextNode(''));
        }
    }
}
