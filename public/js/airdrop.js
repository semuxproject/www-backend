/* global $ */

$(function () {
  $('#verifyAirdropBalance').on('click', function (e) {
    e.preventDefault()
    $.ajax({
      url: '/eth_airdrop_balance',
      type: 'GET',
      data: { eth_address: $('#eth_address').val() },
      success: function (response) {
        if (response.result === 'success') {
          var html = 'ETH address ' + $('#eth_address').val() + '<br> had balance <b>' + response.balance + ' ETH</b> and is eligible to claim <b>' + response.reward + ' SEM</b>'
          $('#eth_address').parent().hide()
          $('#verifyAirdropBalance').hide()
          $('#response').html(html)
          if (response.reward > 0) {
            $('.hidden').show()
          }
        }
        if (response.result === 'error' && response.message !== 'Balance check temporarily unavailable') {
          $('#response').html(response.message)
        } else {
          $('#eth_address').parent().hide()
          $('#verifyAirdropBalance').hide()
          $('#response').html(response.message)
          $('.hidden').show()
        }
      }
    })
  })
})
