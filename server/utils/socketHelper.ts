const users=new Map()

export const handleConnections(userId:string):number{
    const count = users.get(userId) || 0
    users.set(userId, count + 1)
    return count===0
}