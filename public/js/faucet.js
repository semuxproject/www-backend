/* global $ */

$(function () {
  $.ajax({
    url: '/api/v1/get_balance',
    type: 'GET',
    success: function (response) {
      if (response.result === 'success') {
        $('#walletBalance').text('Balance left in the wallet: ' + response.balance + ' SEM')
        $('#sentCoins').text('Have sent already: ' + response.sent + ' SEM')
      }
    }
  })
})
