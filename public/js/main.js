document.addEventListener('DOMContentLoaded', () => {

    let refreshRequired = false

    document.body.querySelector('.bottom-nav .main').addEventListener('click', () => {
        document.querySelector('.debt-drawer').classList.add('open')
    })

    document.body.querySelector('.debt-drawer .close').addEventListener('click', () => {
        document.querySelector('.debt-drawer').classList.remove('open')
        if (refreshRequired) location.reload()
        refreshRequired = false
    })

    const drawerTabs = document.body.querySelectorAll('.debt-drawer .tab')
    const drawerWindows = document.body.querySelectorAll('.debt-drawer .window')
    const roommates = document.querySelectorAll('.debt-drawer .mate')
    let selectedMates = []
    let activeForm = 'lender'

    drawerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return true

            roommates.forEach(m => { m.classList.remove('selected') })
            selectedMates = []
            document.querySelectorAll('.amount').forEach(i => { i.value = '' })

            drawerTabs.forEach(t => t.classList.remove('active'))
            tab.classList.add('active')
            activeForm = tab.getAttribute('data-window')

            drawerWindows.forEach(w => w.classList.remove('active'))
            document.querySelector(`.debt-drawer .window.${tab.getAttribute('data-window')}`)
                .classList.add('active')
        })
    })

    roommates.forEach(mate => {
        const mateId = parseInt(mate.getAttribute('data-id'))

        mate.addEventListener('click', () => {
            if (mate.classList.contains('selected')) {
                let newMates = selectedMates.filter(m => m !== mateId)
                selectedMates = newMates
                return mate.classList.remove('selected')
            }

            selectedMates.push(mateId)
            mate.classList.add('selected')
        })
    })

    document.body.querySelectorAll('.debt-drawer form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault()
            const amountInput = form.querySelector('.amount')

            if (amountInput.value.trim() === '' || isNaN(amountInput.value) || amountInput.value.includes('e') || amountInput.value.includes('E') || selectedMates.length === 0) {
                return setAlert('error', 'Lütfen alanı uygun şekilde doldurun.')
            }

            const res = await fetch('/add-debt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: activeForm,
                    mates: selectedMates,
                    amount: amountInput.value
                })
            })
            const resData = await res.json()
            if (!res.ok) return setAlert('error', resData.msg)

            refreshRequired = true
            roommates.forEach(m => { m.classList.remove('selected') })
            selectedMates = []
            document.querySelectorAll('.amount').forEach(i => { i.value = '' })

            setAlert('success', resData.msg)
        })
    })


    function setAlert(status = 'success', message) {
        Swal.fire({
            title: status === 'success' ? 'İşlem başarılı!' : 'Hata!',
            text: message || '',
            icon: status === 'success' ? 'success' : 'error',
            confirmButtonText: 'Tamam'
        })
    }
})