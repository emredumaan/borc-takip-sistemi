document.addEventListener('DOMContentLoaded', () => {
    const requests = document.querySelectorAll('.request')

    requests.forEach(r => {
        r.addEventListener('click', async () => {
            let type = ''
            confirmText = ''
            if (r.classList.contains('debt-r')) {
                type = 'debt'
                confirmText = `${r.querySelectorAll('b')[0].textContent} için 
                ${r.querySelectorAll('b')[1].textContent} borcun var mı?
                `
            }

            if (r.classList.contains('delete-r')) {
                type = 'delete'
                confirmText = `${r.querySelectorAll('b')[0].textContent} onun için verdiğin 
                ${r.querySelectorAll('b')[1].textContent} borcunu ödedi mi?
                `
            }

            const approveOperation = await Swal.fire({
                title: r.querySelectorAll('b')[1].textContent + ' Talebi onayla?',
                text: confirmText,
                icon: 'warning',
                showDenyButton: true,
                confirmButtonColor: '#3085d6',
                denyButtonColor: '#d33',
                confirmButtonText: 'Onayla',
                denyButtonText: 'Yok'
            })

            if (!approveOperation.isConfirmed && !approveOperation.isDenied) return false
            console.log('yarraaaammm')
            const res = await fetch('/approve-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: type,
                    id: r.id,
                    isConfirmed: approveOperation.isConfirmed
                })
            })

            const resData = await res.json()

            if (!res.ok) return Swal.fire({
                title: 'Bi sıkıntı çıktı, tekrar dene.',
                icon: 'error',
                confirmButtonText: 'He, ok',
            })

            const confirm = await Swal.fire({
                title: 'İşlem başarılı',
                text: resData.message,
                icon: 'success',
                allowOutsideClick: false,
                allowEscapeKey: false
            })

            if (confirm.isConfirmed) location.reload()
        })
    })

    document.querySelector('#change-password').addEventListener('click', async () => {
        const changePassword = await Swal.fire({
            title: 'Parola değiştir',
            icon: '',
            html:
                `
              <form id="change-password-form">
                <div class="form-group">
                    <label for="current-password">Mevcut parola</label>
                    <input required id="current-password" type="password">
                </div>
                <div class="form-group">
                    <label for="new-password">Yeni parola</label>
                    <input required id="new-password" type="password">
                    <br>
                    <label for="new-password-confirm">Yeni parolayı doğrula</label>
                    <input required id="new-password-confirm" type="password">
                </div>
              </form>
              `,
            showCloseButton: true,
            showCancelButton: true,
            focusConfirm: false,
            confirmButtonText: 'Değiştir',
            cancelButtonText: 'İptal',
            preConfirm: async () => {
                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const newPasswordConfirm = document.getElementById('new-password-confirm').value;

                const res = await fetch('/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        currentPassword: currentPassword,
                        newPassword: newPassword,
                        newPasswordConfirm: newPasswordConfirm 
                    })
                })

                const resData = await res.json()

                if(!res.ok) return Swal.fire({
                    title: resData.message,
                    icon: 'error',
                })

                const done = await Swal.fire({
                    title: 'İşlem başarılı!',
                    text: resData.message,
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                })
                
                if(done.isConfirmed) logout()
            },
        })
    })

    document.querySelector('#logout').addEventListener('click', logout)

    function logout() {
        location.pathname = '/logout'
    }
})