document.addEventListener('DOMContentLoaded', () => {
    setActiveTab()

    const allDebts = document.querySelectorAll(`.debt`)
    const allLents = document.querySelectorAll(`.lent`)

    const homeTabs = document.body.querySelectorAll('.home .tab')
    const homeWindows = document.body.querySelectorAll('.home .window')

    homeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return true

            homeTabs.forEach(t => t.classList.remove('active'))
            tab.classList.add('active')
            sessionStorage.setItem('activeHomeTab', tab.id)

            homeWindows.forEach(w => w.classList.remove('active'))
            document.querySelector(`.home .window.${tab.getAttribute('data-window')}`)
                .classList.add('active')
        })
    })

    const filterSelect = document.querySelector('#org-filter-select')
    filterSelect.addEventListener('change', () => {
        showRecords('debt', filterSelect.value)
        showRecords('lent', filterSelect.value)
    })

    allDebts.forEach(debt => {
        payDebt(debt, 'debt')
    })

    allLents.forEach(lent => {
        payDebt(lent, 'lent')
    })

    function payDebt(record, type) {
        record.addEventListener('click', async () => {
            let confirmtext = type === 'debt' ?
                `${record.querySelector('.name').textContent} için olan ${record.querySelector('.amount').textContent} borcun silinecek. Onaylıyor musun?`
                : `${record.querySelector('.name').textContent} için verdiğin ${record.querySelector('.amount').textContent} borç silinecek. Onaylıyor musun?`

            const deleteOperation = await Swal.fire({
                title: record.querySelector('.amount').textContent + ' Borcu sil?',
                text: confirmtext,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Evet, borcu sil',
                cancelButtonText: 'İptal'
            })
            if (!deleteOperation.isConfirmed) return

            const res = await fetch('/pay-debt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: record.id,
                    type: type
                })
            })

            if (!res.ok) return Swal.fire(
                'Hata',
                'Bir sorun oluştu, lütfen tekrar deneyin.',
                'error'
            )

            if (res.ok) {
                let confText = type === 'debt' ?
                    `Borç silme talebiniz oluşturuldu.`
                    : `Borç silindi.`

                const conf = await Swal.fire({
                    title: 'İşlem başarılı!',
                    text: confText,
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                },
                )

                if (conf.isConfirmed) location.reload()
            }
        })
    }

    function showRecords(type = 'debt', id = null) {

        const selectedRecords = type === 'debt' ? allDebts : allLents
        let returnValues = selectedRecords

        if (id && id !== 'all') {
            returnValues = []
            selectedRecords.forEach(rec => {
                rec.getAttribute('data-user') === id ? returnValues.push(rec) : ''
            })
        }

        const wrapperWindow = type === 'debt' ? document.body.querySelector('.debtor-home') : document.body.querySelector('.lender-home')

        wrapperWindow.classList.contains('debtor-home') ? document.querySelector('.debtor-home').innerHTML = ''
            : document.querySelector('.lender-home').innerHTML = ''

        if (returnValues.length === 0) return wrapperWindow.innerHTML = `
        <div class="empty-list">
            <span class="material-symbols-rounded">
                contract
            </span>
            <span>Hiç kayıt bulunamadı</span>
        </div>
        `

        returnValues.forEach(element => {
            wrapperWindow.insertAdjacentElement('beforeend', element)
        })
    }

    function setActiveTab() {
        let activeTab = sessionStorage.getItem('activeHomeTab')
        if (activeTab === 'lender-tab') {
            document.querySelector('#lender-tab').classList.add('active')
            document.querySelector('#debtor-tab').classList.remove('active')

            document.querySelector('.lender-home').classList.add('active')
            document.querySelector('.debtor-home').classList.remove('active')

        }
    }

})