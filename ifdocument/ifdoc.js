function getIfdoc(){
  return `
openapi: 3.0.0
info:
  title: OpenAPI Tutorial
  description: OpenAPI Tutorial by halhorn
  version: 0.0.0
servers:
  - url: https://example.com/api/v0
    description: プロダクション API
  - url: http://{host}:{port}/api/v0
    description: 開発用
    variables:
      host:
        default: localhost
      port:
        default: '10080'
paths:
  /test/{testId1}/{testId2}:
    post:
      summary: test summary
      tags:
      - test
      operationId: test
      parameters:
        - name: testId1
          in: path
          required: true
          description: Parameter description in CommonMark or HTML.
          schema:
            type : integer
            format: int64
            minimum: 1
        - name: testId2
          in: path
          required: true
          description: Parameter description in CommonMark or HTML.
          schema:
            type : integer
            format: int64
            minimum: 1
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NamespacePostBodies'
      responses:
        '201':
          description: Namespace created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BasicResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '409':
          $ref: '#/components/responses/Conflict'
        '500':
          $ref: '#/components/responses/InternalServerError'
        '502':
          $ref: '#/components/responses/BadGateway'
        '503':
          $ref: '#/components/responses/ServiceUnavailable'
      description: POST operation for endpoint '/test'
  /users/{userId}:
    get:
      summary: Returns a user by ID.
      parameters:
        - name: userId
          in: path
          required: true
          description: Parameter description in CommonMark or HTML.
          schema:
            type : integer
            format: int64
            minimum: 1
      responses: 
        '200':
          description: OK
  /users:
    post:
      summary: Creates a user.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
      responses: 
        '201':
          description: Created
components:
  schemas:
    get_health_response:
      description: サーバーの状態のレスポンス
      type: object
      properties:
        status:
          type: string
          enum:
            - ok
      required:
        - status
  `
}








