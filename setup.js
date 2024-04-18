
const { Command } = require('commander')
const fs = require('fs')
const bcrypt = require('bcrypt')
const { Sequelize } = require('sequelize')
const mysql = require('mysql2/promise')
const inquirer = require('inquirer')
const program = new Command()
const chalk = require('chalk')

// Default database credentials
const defaultDBCredentials = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'debttracker',
    port: 3306
};

const showHeader = () => {
const mayneym = `   
 ________  _________ _____  ______ _   ____  ___  ___   _   __ 
 |  ___|  \\/  || ___ \\  ___| |  _  \\ | | |  \\/  | / _ \\ | \\ | | 
 | |__ | .  . || |_/ / |__   | | | | | | | .  . |/ /_\\ \\|  \\| | 
 |  __|| |\\/| ||    /|  __|  | | | | | | | |\\/| ||  _  || . \` | 
 | |___| |  | || |\\ \\| |___  | |/ /| |_| | |  | || | | || |\\  | 
 \\____/\\_|  |_/\\_| \\_\\____/  |___/  \\___/\\_|  |_/\\_| |_/\\_| \\_/ 
                                    
`
console.clear()
console.log(chalk.hex('#e8294f').bold(mayneym))
console.log(chalk.cyan('Borç Takip (KYK502 - BYS),') + chalk.cyan.bold(' Emre DUMAN ') + chalk.cyan('tarafından oluşturulmuş açık kaynak kodlu bir projedir. Ticari amaçlarla kullanılamaz.'));
console.log(chalk.cyan('\nhttps://emre.duman.web.tr'))
console.log(chalk.cyan('\n----------------------------------------------------------------\n'))
}

// Command to set up the configuration
program
    .command('setup')
    .description('Veri tabanı konfigürasyonunu oluştur')
    .action(async () => {
        showHeader()

        const dbCredentials = await inquirer.prompt([
            {
                type: 'input',
                name: 'host',
                message: 'Database host:',
                default: defaultDBCredentials.host
            },
            {
                type: 'input',
                name: 'user',
                message: 'Database user:',
                default: defaultDBCredentials.user
            },
            {
                type: 'password',
                name: 'password',
                message: 'Database password:',
                default: defaultDBCredentials.password
            },
            {
                type: 'input',
                name: 'database',
                message: 'Database name:',
                default: defaultDBCredentials.database
            },
            {
                type: 'input',
                name: 'port',
                message: 'Database port:',
                default: defaultDBCredentials.port
            }
        ])

        const configContent = `const config = ${JSON.stringify({ db: {...dbCredentials,created_via_CLI:true}, server: { port: 3000 } }, null, 4)}\n\nmodule.exports = config`
        fs.writeFileSync('config.js', configContent)

        console.log('Bilgiler "config.js" dosyasına kaydedildi.')

        const sequelize = new Sequelize(dbCredentials.database, dbCredentials.user, dbCredentials.password, {
            host: dbCredentials.host,
            port: dbCredentials.port,
            dialect: 'mysql'
        });
        try {
            const { host, port, user, password, database } = dbCredentials
            const connection = await mysql.createConnection({ host, port, user, password })
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)

            await sequelize.authenticate()
            console.log('Veri tabanı bağlantısı başarılı.')

            const User = require('./models/User')
            const Debt = require('./models/Debt')

            Debt.belongsTo(User, {
                foreignKey: 'debtorId'
            })

            await User.sync()
            await Debt.sync()
            await sequelize.sync()

        } catch (error) {
            console.error('Veri tabanına bağlanılamıyor:', error)
        } finally {
            await sequelize.close()
            console.log(chalk.green('\nVeri tabanı konfigürasyonu tamamlandı. Artık kullanıcı oluşturabilirsiniz.\n'))
            process.exit()
        }
    });

program
    .command('create-user')
    .description('Yeni kullanıcı oluştur.')
    .action(async () => {
        showHeader()

        const { db } = require('./config')

        if(!db.created_via_CLI) {
            console.log(chalk.yellow('\nBu komutu kullanmadan önce veri tabanını oluşturmalısınız. Bunun için "node setup.js setup" komutunu çalıştırın.\n'))
            return process.exit()
        } 


        const sequelize = new Sequelize(db.database, db.user, db.password, {
            host: db.host,
            port: db.port,
            dialect: 'mysql'
        })

        let uname
        try {

            const { username, name, password } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'username',
                    message: 'Kullanıcı adı girin:'
                },
                {
                    type: 'input',
                    name: 'name',
                    message: 'İsim - soyisim girin:'
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'Kullanıcı parolasını belirleyin:'
                }
            ]);
            uname = username

            const User = require('./models/User')

            await sequelize.authenticate()
            console.log('Veri tabanı bağlantısı başarılı.')

            const hashedPassword = await bcrypt.hash(password, 10)
            await User.create({ username, name, role: 'user', password: hashedPassword })

        } catch (error) {
            console.error('Veri tabanına bağlanılamıyor:', error)
        } finally {
            await sequelize.close()
            console.log(chalk.green(`\nKullanıcı ${uname} başarıyla oluşturuldu.\n`))
            process.exit()
        }
    })

program.parse(process.argv)
