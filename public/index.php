<?php
header("Cache-Control: no-cache, must-revalidate");
?>

<html>
    <head>
        <title>SC2BO</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <style>
            table {
                background-color: 'red';
                width: 1000px !important;
                table-layout: fixed;
                word-wrap:break-word;
                border-collapse: collapse;
            }
        </style>
    </head>
    <body>
        <div id="container" class="container bo-container">
            <div class="row m-3 bg-light">
                <div class="col">
                    <span class="bo-title"></span> from <span class="bo-author"></span> (<span class="bo-date"></span>)
                </div>
                <div class="col bo-race">
                </div>
            </div>
            <div class="row">
                <div class="col-2">
                    <p>Building</p>
                </div>
                <div class="col">
                    <p>Production Queue</p>
                </div>
            </div>

            <div class="row my-4 mx-1 overflow-auto">
                <div class="col">
                    <input type="text" readonly class="bo-slider-current-timeline">
                    <span>Minerals: <span class="bo-current-mineral"></span></span>
                    <span>Gas: <span class="bo-current-gas"></span></span>
                    <span>Supply: <span class="bo-current-supply"></span>/<span class="bo-current-max-supply"></span></span>
                    <span>Workers: <span class="bo-current-total-worker-count"></span>
                    (<span class="bo-current-gas-worker-count"></span> gas)
                    
                    </span>
                </div>
            </div>

            <div class="row my-4 mx-1 overflow-auto">
                <div class="col">

                    <!-- Percent slider, 'max' highest value to have maximum precision (can be approximative to < one second) -->
                    <input type="range" min="0" max="100" class="w-100 slider-timeline">
                </div>
            </div>

            <div class="row my-4 mx-1">
                <div class="col">
                    <table class="table table-dark table-bordered bo-table w-100">
                        <tbody>
                            <tr>
                                <td colspan="12">SCV</td>
                                <td colspan="12">SCV</td>
                                <td colspan="12">SCV</td>
                                <td colspan="12">SCV</td>
                                <td colspan="12">SCV</td>
                                <td colspan="12">SCV</td>
                                <td colspan="12">SCV</td>
                                <td colspan="12">SCV</td>
                                <td colspan="12">SCV</td>
                            </tr>
                            <tr>
                                <td colspan="30"></td>
                                <td colspan="46">Barracks</th>
                                <td colspan="18">Marine</td>
                                <td colspan="18">Marine</td>
                                <td colspan="18">Marine</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <form class="form-add-queue">
                        <select class='select-units-list'></select>
                        <input type="text" placeholder='00:00' class="time">
                        <select class='select-production-facility-row'></select>
                        <input type="submit" class="btn btn-success">
                    </form>
                </div>
            </div>
        </div>

        <script src="vendor/jquery-3.4.1.min.js"></script>

        <!--
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
        -->

        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
       
        <script src="vendor/sorted-array.js"></script>
        <script src="scripts/UUID.js"></script>
        <script src="scripts/buildorder.js"></script>
        <script src="scripts/buttons.js"></script>
        <script src="scripts/view.js"></script>
    </body>
</html>