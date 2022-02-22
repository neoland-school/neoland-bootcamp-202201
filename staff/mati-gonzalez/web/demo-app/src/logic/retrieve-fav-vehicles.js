import { validateToken } from './helpers/validators'

function retrieveFavVehicles(token) {
    validateToken(token)

    return fetch('https://b00tc4mp.herokuapp.com/api/v2/users', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => {
            const { status } = res

            if (status === 200) {
                return res.json()
                    .then(user => {
                        const { favs = [] } = user

                        if (!favs.length) return []

                        const fetches = favs.map((vehicleId) => {
                            return fetch(`https://b00tc4mp.herokuapp.com/api/hotwheels/vehicles/${vehicleId}`)
                                .then(res => {
                                    const { status } = res

                                    if (status === 200) {
                                        return res.json()
                                            .then(vehicle => {
                                                vehicle.isFav = true

                                                return vehicle
                                            })
                                    } else if (status >= 400 && status < 500) {
                                        return res.json()
                                            .then(payload => {
                                                const { error } = payload

                                                throw new Error(error)
                                            })
                                    } else if (status >= 500) {
                                        throw new Error('server error')
                                    } else {
                                        throw new Error('unknown error')
                                    }
                                })
                        })
                        return Promise.all(fetches)
                    })

            } else if (status >= 400 && status < 500) {
                return res.json()
                    .then(payload => {
                        const { error } = payload

                        throw new Error(error)
                    })
            } else if (status >= 500) {
                throw new Error('server error')
            } else {
                throw new Error('unknown error')
            }
        })
}

export default retrieveFavVehicles