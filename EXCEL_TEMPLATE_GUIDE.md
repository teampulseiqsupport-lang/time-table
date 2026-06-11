This is a sample Excel template guide. Create an .xlsx file with these headers:

| Section | Day       | Subject          | Code    | Faculty       | Room | Block | StartTime   | EndTime     | Type   | Session | Year     |
|---------|-----------|------------------|---------|---------------|------|-------|-------------|-------------|--------|---------|----------|
| 3A      | Monday    | Java Programming | PCS-301 | Rajesh Kumar  | 304  | AB1   | 08:00 AM    | 09:00 AM    | Theory | 2024-25 | 3rd Year |
| 3A      | Monday    | DBMS             | PCS-302 | Priya Singh   | 205  | AB2   | 09:00 AM    | 10:00 AM    | Theory | 2024-25 | 3rd Year |
| 3A      | Monday    | Lunch            |         |               |      |       | 01:00 PM    | 02:00 PM    | Lunch  | 2024-25 | 3rd Year |
| 3A,3B   | Tuesday   | CN               | PCS-303 | Amit Verma    | 101  | AB1   | 10:00 AM    | 11:00 AM    | Theory | 2024-25 | 3rd Year |
| 3A-3F   | Wednesday | Java Lab         | PCS-301 | Rajesh Kumar  | L5   | Lab   | 02:00 PM    | 04:00 PM    | Lab    | 2024-25 | 3rd Year |

Notes:
- Section field supports: "3A" (single), "3A,3B,3C" (comma-separated), "3A-3F" (range)
- Day must be: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
- Type can be: Theory, Lab, Lunch, Free
- Time format: "08:00 AM" or "02:30 PM"
- Free periods are automatically hidden from student view
