import { AttributeDefinition, AttributeValue, CreateTableCommand, DescribeTableCommand, DynamoDBClient, GetItemCommand, KeySchemaElement, PutItemCommand, ScalarAttributeType } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';
import { Config } from './const';
import { match, P } from 'ts-pattern';

const argRegion = process.argv.find(a => a.startsWith('dynamoDbRegion='))

const REGION = Config.REGION;
const client = new DynamoDBClient(
    { endpoint: 'http://localhost:8000', region: REGION, credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' }, }
);
const awsDynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'blogs'
const PRIMARY_ATTRIBUTE_NAME = 'blogId';

const columNames = [PRIMARY_ATTRIBUTE_NAME, 'title', 'createdAt', 'updatedAt'] as const;
type ApplicationType = 'string' | 'number' | 'date'
const colums: { name: string, attributeType: ScalarAttributeType, applicationType: ApplicationType, isNull?: boolean }[] = columNames.map(cn => ({
    name: cn,
    attributeType: match(cn)
        .with(P.union('blogId', 'createdAt', 'title', 'updatedAt'), (): ScalarAttributeType => 'S')
        .exhaustive(),
    applicationType: match(cn)
        .with(P.union('blogId', 'title'), (): ApplicationType => 'string')
        .with(P.union('createdAt', 'updatedAt'), (): ApplicationType => 'date')
        .exhaustive(),
}))

const tableSchema: AttributeDefinition[] = colums.map(c => ({ AttributeName: c.name, AttributeType: c.attributeType }))

const keySchema: KeySchemaElement[] = [
    { AttributeName: PRIMARY_ATTRIBUTE_NAME, KeyType: 'HASH' }
]

export const createTable = async () => {
    const getCommand = new DescribeTableCommand({
        TableName: TABLE_NAME
    })
    const res = await client.send(getCommand);
    if (res.Table) {
        console.log(`すでにテーブル名:${TABLE_NAME}は存在しています`)
        return;
    }

    const command = new CreateTableCommand({
        AttributeDefinitions: tableSchema,
        TableName: TABLE_NAME,
        KeySchema: keySchema
    })
    await client.send(command);
}

export const storePostInDb = async ({ blogId, title }: { blogId?: string, title?: string }) => {

    const id = blogId ? blogId : ulid()

    const baseItemData: Record<string, AttributeValue> = {
        blogId: {
            S: id
        },
        title: {
            S: title ? title : '無題'
        },
    }


    const itemData = blogId && !!(await getBlogById(blogId)) ? {
        ...baseItemData, updatedAt: {
            S: `${new Date()}`
        }
    } : {
        ...baseItemData, createdAt: {
            S: `${new Date()}`
        },
    }

    const command = new PutItemCommand({
        TableName: 'blogs',
        Item: { ...itemData }
    })

    await awsDynamoDb.send(command);

    return id;
}

// FIXME: ここらへんの型定義は相当バグの温床なので、直すこと
type UnionPick<T, U extends T> = U;
type Data = {
    [key in typeof columNames[number]]: key extends UnionPick<typeof columNames[number], 'blogId' | 'title'> ? string : Date;
}
export const getBlogById = async (blogId: string): Promise<Data | undefined> => {
    const getCcommand = new GetItemCommand({
        TableName: 'blogs',
        Key: { blogId: { S: blogId } }
    })

    const res = await awsDynamoDb.send(getCcommand);


    const data = res.Item

    return data ? {
        blogId: data['blogId']?.S ?? '',
        title: data['title']?.S ?? '',
        createdAt: new Date(data['createdAt']?.S ?? ''),
        updatedAt: new Date(data['updatedAt']?.S ?? '')
    } : undefined;
}